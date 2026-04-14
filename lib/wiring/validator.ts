import type { Wire, PinRef, PlacedBreadboard } from '@/stores/projectStore';
import type { BoardModelId } from '@/stores/projectStore';
import { resolvePinRole } from './engine';
import type { PlacedComponent } from '@/stores/projectStore';

/**
 * Serialize a PinRef to a unique string key for graph nodes.
 */
export function pinRefKey(ref: PinRef): string {
  if (ref.type === 'board') return `board:${ref.boardId}:${ref.pinNumber}`;
  if (ref.type === 'component') return `comp:${ref.componentId}:${ref.pinId}`;
  if (ref.type === 'breadboard') {
    if (ref.rail) return `bb:${ref.breadboardId}:rail:${ref.rail}:${ref.row}:${ref.col}`;
    return `bb:${ref.breadboardId}:${ref.row}:${ref.col}`;
  }
  return 'unknown';
}

export interface ElectricalNode {
  ref: PinRef;
  type: 'power' | 'ground' | 'signal';
}

export interface ConnectivityGraph {
  nodes: Map<string, ElectricalNode>;
  edges: Map<string, Set<string>>;
}

/**
 * Determine the breadboard bus group key for a breadboard pin.
 * Pins in the same row within the same bus group (a-e or f-j) are connected.
 * Power rails: all holes in the same rail (positive/negative) on the same half are connected.
 */
function breadboardBusKey(ref: PinRef & { type: 'breadboard' }): string | null {
  if (ref.rail) {
    // Power rail: all holes in the same rail type on the same breadboard are connected
    // Rails are split at midpoint (col 31), but for simplicity we treat each rail as one bus
    return `bb:${ref.breadboardId}:rail:${ref.rail}:${ref.row}`;
  }
  // Bus group: rows 0-4 (a-e) share a bus per column, rows 5-9 (f-j) share a bus per column
  const busGroup = ref.row < 5 ? 'top' : 'bottom';
  return `bb:${ref.breadboardId}:bus:${busGroup}:${ref.col}`;
}

/**
 * Build a connectivity graph from wires and breadboard bus connections.
 */
export function buildConnectivityGraph(
  wires: Record<string, Wire>,
  breadboards: Record<string, PlacedBreadboard>,
  boardModel: BoardModelId,
  components: Record<string, PlacedComponent>,
): ConnectivityGraph {
  const nodes = new Map<string, ElectricalNode>();
  const edges = new Map<string, Set<string>>();

  function addNode(ref: PinRef): string {
    const key = pinRefKey(ref);
    if (!nodes.has(key)) {
      const role = resolvePinRole(ref, boardModel, components);
      nodes.set(key, { ref, type: role === 'power' ? 'power' : role === 'ground' ? 'ground' : 'signal' });
      edges.set(key, new Set());
    }
    return key;
  }

  function addEdge(a: string, b: string) {
    if (a === b) return;
    edges.get(a)?.add(b);
    edges.get(b)?.add(a);
  }

  // Add wire connections
  for (const wire of Object.values(wires)) {
    const startKey = addNode(wire.startPinRef);
    const endKey = addNode(wire.endPinRef);
    addEdge(startKey, endKey);
  }

  // Add breadboard bus connections
  // Group all breadboard pins by their bus key
  const busGroups = new Map<string, string[]>();

  for (const key of nodes.keys()) {
    const node = nodes.get(key)!;
    if (node.ref.type === 'breadboard') {
      const busKey = breadboardBusKey(node.ref as PinRef & { type: 'breadboard' });
      if (busKey) {
        if (!busGroups.has(busKey)) busGroups.set(busKey, []);
        busGroups.get(busKey)!.push(key);
      }
    }
  }

  // Connect all pins in the same bus group
  for (const group of busGroups.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        addEdge(group[i], group[j]);
      }
    }
  }

  return { nodes, edges };
}

/**
 * BFS to find all nodes reachable from a starting node.
 */
function bfs(graph: ConnectivityGraph, startKey: string): Set<string> {
  const visited = new Set<string>();
  const queue = [startKey];
  visited.add(startKey);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = graph.edges.get(current);
    if (!neighbors) continue;
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

export interface ShortCircuitWarning {
  powerNode: string;
  groundNode: string;
  message: string;
}

/**
 * Detect short circuits: power node reachable to ground node through zero-resistance paths.
 */
export function detectShortCircuits(graph: ConnectivityGraph): ShortCircuitWarning[] {
  const warnings: ShortCircuitWarning[] = [];
  const powerNodes: string[] = [];
  const groundNodes = new Set<string>();

  for (const [key, node] of graph.nodes) {
    if (node.type === 'power') powerNodes.push(key);
    if (node.type === 'ground') groundNodes.add(key);
  }

  for (const powerKey of powerNodes) {
    const reachable = bfs(graph, powerKey);
    for (const groundKey of groundNodes) {
      if (reachable.has(groundKey)) {
        const powerNode = graph.nodes.get(powerKey)!;
        const groundNode = graph.nodes.get(groundKey)!;
        const powerLabel = pinRefLabel(powerNode.ref);
        const groundLabel = pinRefLabel(groundNode.ref);
        warnings.push({
          powerNode: powerKey,
          groundNode: groundKey,
          message: `Short circuit detected between ${powerLabel} and ${groundLabel}`,
        });
      }
    }
  }

  return warnings;
}

/**
 * Check if two pins are electrically connected (path exists through wires and/or breadboard bus).
 */
export function areConnected(graph: ConnectivityGraph, refA: PinRef, refB: PinRef): boolean {
  const keyA = pinRefKey(refA);
  const keyB = pinRefKey(refB);
  if (!graph.nodes.has(keyA) || !graph.nodes.has(keyB)) return false;
  if (keyA === keyB) return true;
  const reachable = bfs(graph, keyA);
  return reachable.has(keyB);
}

/**
 * Get all connected components (groups of connected pins).
 */
export function getConnectedGroups(graph: ConnectivityGraph): Set<string>[] {
  const visited = new Set<string>();
  const groups: Set<string>[] = [];

  for (const key of graph.nodes.keys()) {
    if (!visited.has(key)) {
      const group = bfs(graph, key);
      groups.push(group);
      for (const k of group) visited.add(k);
    }
  }

  return groups;
}

/**
 * Human-readable label for a PinRef.
 */
function pinRefLabel(ref: PinRef): string {
  if (ref.type === 'board') return `Board Pin ${ref.pinNumber}`;
  if (ref.type === 'component') return `Component ${ref.componentId} Pin ${ref.pinId}`;
  if (ref.type === 'breadboard') {
    if (ref.rail) return `Breadboard ${ref.rail} rail (col ${ref.col})`;
    return `Breadboard row ${ref.row} col ${ref.col}`;
  }
  return 'Unknown pin';
}

/**
 * Validate all wires and return short-circuit warnings.
 * Logs warnings to console.
 */
export function validateWiring(
  wires: Record<string, Wire>,
  breadboards: Record<string, PlacedBreadboard>,
  boardModel: BoardModelId,
  components: Record<string, PlacedComponent>,
): ShortCircuitWarning[] {
  const graph = buildConnectivityGraph(wires, breadboards, boardModel, components);
  const warnings = detectShortCircuits(graph);

  for (const w of warnings) {
    console.warn(`⚡ ${w.message}`);
  }

  return warnings;
}
