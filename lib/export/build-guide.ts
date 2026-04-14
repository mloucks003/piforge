import type {
  PlacedComponent,
  PlacedBreadboard,
  Wire,
  PinRef,
} from '@/stores/projectStore';
import { getComponentDefinition } from '@/lib/components';

/**
 * Format a PinRef into a human-readable label.
 */
function pinRefLabel(ref: PinRef): string {
  if (ref.type === 'board') {
    return `Board Pin ${ref.pinNumber}`;
  }
  if (ref.type === 'component') {
    return `${ref.componentId}:${ref.pinId}`;
  }
  if (ref.type === 'breadboard') {
    if (ref.rail) {
      return `Breadboard ${ref.breadboardId} ${ref.rail} rail (col ${ref.col})`;
    }
    return `Breadboard ${ref.breadboardId} row ${ref.row} col ${ref.col}`;
  }
  return 'Unknown';
}

export interface BuildGuideInput {
  boardModel: string;
  components: Record<string, PlacedComponent>;
  breadboards: Record<string, PlacedBreadboard>;
  wires: Record<string, Wire>;
  code: string;
  language: string;
}

/**
 * Generate a Markdown build guide from the current project state.
 */
export function generateBuildGuide(input: BuildGuideInput): string {
  const { boardModel, components, breadboards, wires, code, language } = input;
  const lines: string[] = [];

  lines.push('# PiForge Build Guide');
  lines.push('');
  lines.push(`## Board: Raspberry Pi ${boardModel === 'pi5' ? '5' : '4'}`);
  lines.push('');

  // Parts list
  const compEntries = Object.values(components);
  lines.push('## Parts List');
  lines.push('');
  if (compEntries.length === 0) {
    lines.push('No components placed.');
  } else {
    lines.push('| # | Component | Type |');
    lines.push('|---|-----------|------|');
    compEntries.forEach((comp, i) => {
      const def = getComponentDefinition(comp.definitionId);
      const name = def?.name ?? comp.definitionId;
      const category = def?.category ?? 'unknown';
      lines.push(`| ${i + 1} | ${name} | ${category} |`);
    });
  }
  lines.push('');

  // Breadboards
  const bbEntries = Object.values(breadboards);
  if (bbEntries.length > 0) {
    lines.push('## Breadboards');
    lines.push('');
    bbEntries.forEach((bb, i) => {
      lines.push(`${i + 1}. ${bb.type} breadboard (ID: ${bb.id})`);
    });
    lines.push('');
  }

  // Wiring table
  const wireEntries = Object.values(wires);
  lines.push('## Wiring Connections');
  lines.push('');
  if (wireEntries.length === 0) {
    lines.push('No wires.');
  } else {
    lines.push('| # | From | To | Color |');
    lines.push('|---|------|----|-------|');
    wireEntries.forEach((wire, i) => {
      const from = pinRefLabel(wire.startPinRef);
      const to = pinRefLabel(wire.endPinRef);
      lines.push(`| ${i + 1} | ${from} | ${to} | ${wire.color} |`);
    });
  }
  lines.push('');

  // Code
  lines.push('## Code');
  lines.push('');
  if (code.trim()) {
    lines.push(`\`\`\`${language}`);
    lines.push(code);
    lines.push('```');
  } else {
    lines.push('No code written.');
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Trigger a download of the build guide as a .md file.
 */
export function downloadBuildGuide(markdown: string, filename = 'piforge-build-guide.md'): void {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
