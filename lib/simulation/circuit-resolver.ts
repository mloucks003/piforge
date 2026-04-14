/**
 * Circuit Resolver — generically traces wiring for ALL component types.
 * Uses component pin definitions (signal/ground/power/data) to determine
 * which GPIO pins each component is connected to and whether it is
 * fully wired. Backward-compatible fields (gpioPin, hasGround, isComplete)
 * are preserved for callers that only need the basic info.
 */
import type { Wire, PinRef, PlacedComponent } from '@/stores/projectStore';
import { getBoardModel } from '@/lib/boards';
import { getComponentDefinition } from '@/lib/components';

/** Per-pin resolved connection data */
export interface PinConnection {
  pinId: string;
  pinLabel: string;
  pinType: 'power' | 'ground' | 'signal' | 'data';
  /** BCM GPIO number if this pin is wired to a GPIO, else null */
  gpioPin: number | null;
  /** True if this power/ground pin reaches a board power rail */
  reachesPower: boolean;
  /** True if this ground pin reaches a board GND pin */
  reachesGround: boolean;
  /** True if any wire is attached to this pin at all */
  isWired: boolean;
}

export interface ComponentConnection {
  componentId: string;
  definitionId: string;
  /** Per-pin breakdown */
  pinConnections: PinConnection[];
  /** Backward-compat: first signal/data GPIO found */
  gpioPin: number | null;
  /** Backward-compat: at least one ground pin reaches GND */
  hasGround: boolean;
  /** Backward-compat: signal connected + (ground required → ground connected) */
  isComplete: boolean;
  /** Human-readable list of what's still missing */
  missingConnections: string[];
}

function pinRefKey(ref: PinRef): string {
  if (ref.type === 'board') return `board:${ref.pinNumber}`;
  if (ref.type === 'component') return `comp:${ref.componentId}:${ref.pinId}`;
  if (ref.type === 'breadboard') return `bb:${ref.breadboardId}:${ref.row}:${ref.col}`;
  return 'unknown';
}

function getBoardPinType(pinNumber: number, boardModel: string): 'power' | 'ground' | 'gpio' {
  const board = getBoardModel(boardModel as 'pi4' | 'pi5');
  const pin = board.gpioHeader.find(p => p.pinNumber === pinNumber);
  if (!pin) return 'gpio';
  if (pin.type === 'ground') return 'ground';
  if (pin.type === 'power') return 'power';
  return 'gpio';
}

function getBoardPinGPIO(pinNumber: number, boardModel: string): number | null {
  const board = getBoardModel(boardModel as 'pi4' | 'pi5');
  const pin = board.gpioHeader.find(p => p.pinNumber === pinNumber);
  return pin?.gpioNumber ?? null;
}

/**
 * Build adjacency list from wires + breadboard bus connections
 */
function buildGraph(wires: Record<string, Wire>): Map<string, Set<string>> {
  const edges = new Map<string, Set<string>>();
  function addEdge(a: string, b: string) {
    if (!edges.has(a)) edges.set(a, new Set());
    if (!edges.has(b)) edges.set(b, new Set());
    edges.get(a)!.add(b);
    edges.get(b)!.add(a);
  }
  for (const wire of Object.values(wires)) {
    addEdge(pinRefKey(wire.startPinRef), pinRefKey(wire.endPinRef));
  }
  // Breadboard bus: same breadboard, same column, same bus group (0-4 or 5-9) are connected
  const bbPins = new Map<string, string[]>();
  for (const key of edges.keys()) {
    const m = key.match(/^bb:(.+):(\d+):(\d+)$/);
    if (m) {
      const [, bbId, rowStr, colStr] = m;
      const row = parseInt(rowStr);
      const col = parseInt(colStr);
      const bus = row < 5 ? 'top' : 'bottom';
      const busKey = `${bbId}:${bus}:${col}`;
      if (!bbPins.has(busKey)) bbPins.set(busKey, []);
      bbPins.get(busKey)!.push(key);
    }
  }
  for (const group of bbPins.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        addEdge(group[i], group[j]);
      }
    }
  }
  return edges;
}

function bfs(graph: Map<string, Set<string>>, start: string): Set<string> {
  const visited = new Set<string>();
  const queue = [start];
  visited.add(start);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const neighbor of graph.get(cur) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}

/**
 * Resolve which components are properly connected in the circuit.
 * Works generically for ALL component types using pin definitions.
 * Returns a map of componentId → connection info.
 */
export function resolveCircuit(
  components: Record<string, PlacedComponent>,
  wires: Record<string, Wire>,
  boardModel: string,
): Map<string, ComponentConnection> {
  const graph = buildGraph(wires);
  const result = new Map<string, ComponentConnection>();

  for (const comp of Object.values(components)) {
    const def = getComponentDefinition(comp.definitionId);
    if (!def) continue;

    const pinConnections: PinConnection[] = [];

    for (const pin of def.pins) {
      const pinKey = `comp:${comp.id}:${pin.id}`;
      const isWired = graph.has(pinKey);

      const pc: PinConnection = {
        pinId: pin.id,
        pinLabel: pin.label,
        pinType: pin.type,
        gpioPin: null,
        reachesPower: false,
        reachesGround: false,
        isWired,
      };

      if (isWired) {
        const reachable = bfs(graph, pinKey);
        for (const key of reachable) {
          const m = key.match(/^board:(\d+)$/);
          if (!m) continue;
          const pinNum = parseInt(m[1]);
          const bType = getBoardPinType(pinNum, boardModel);
          if (bType === 'gpio') {
            const gpio = getBoardPinGPIO(pinNum, boardModel);
            if (gpio !== null && pc.gpioPin === null) pc.gpioPin = gpio;
          } else if (bType === 'ground') {
            pc.reachesGround = true;
          } else if (bType === 'power') {
            pc.reachesPower = true;
          }
        }
      }

      pinConnections.push(pc);
    }

    // Derive summary fields
    const signalPins = pinConnections.filter(p => p.pinType === 'signal' || p.pinType === 'data');
    const groundPins = pinConnections.filter(p => p.pinType === 'ground');
    const powerPins  = pinConnections.filter(p => p.pinType === 'power');

    const firstGpio = signalPins.find(p => p.gpioPin !== null)?.gpioPin ?? null;
    const hasGround = groundPins.length === 0 || groundPins.some(p => p.reachesGround);
    const hasPower  = powerPins.length === 0  || powerPins.some(p => p.reachesPower || p.reachesGround);
    const hasSignal = signalPins.length === 0 || signalPins.some(p => p.gpioPin !== null || p.isWired);

    // Build missing list
    const missing: string[] = [];
    for (const p of signalPins) {
      if (!p.isWired) missing.push(`${p.pinLabel} → GPIO pin`);
    }
    for (const p of groundPins) {
      if (!p.reachesGround) missing.push(`${p.pinLabel} → GND`);
    }
    for (const p of powerPins) {
      if (!p.reachesPower && !p.reachesGround) missing.push(`${p.pinLabel} → 3.3V or 5V`);
    }

    const isComplete = hasSignal && hasGround && hasPower;

    result.set(comp.id, {
      componentId: comp.id,
      definitionId: comp.definitionId,
      pinConnections,
      gpioPin: firstGpio,
      hasGround,
      isComplete,
      missingConnections: missing,
    });
  }

  return result;
}
