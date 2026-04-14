import { useAIStore, type AIMode, type AIMessage, type AIRole } from '@/stores/aiStore';
import { useProjectStore } from '@/stores/projectStore';
import { getComponentDefinition } from '@/lib/components';

function serializeContext() {
  const s = useProjectStore.getState();

  const comps = Object.values(s.components).map((c) => {
    const def = getComponentDefinition(c.definitionId);
    return `- ${def?.name ?? c.definitionId}`;
  }).join('\n') || 'None';

  const wireLines = Object.values(s.wires).map((w) => {
    const fmt = (r: typeof w.startPinRef) => {
      if (r.type === 'board') return `GPIO${r.pinNumber}`;
      if (r.type === 'component') return `${r.componentId}.${r.pinId}`;
      if (r.type === 'breadboard') return `breadboard[${r.row},${r.col}]`;
      return '?';
    };
    return `${fmt(w.startPinRef)} → ${fmt(w.endPinRef)}`;
  }).join('\n') || 'None';

  const consoleLines = s.consoleOutput
    .slice(-30)
    .map((e) => `[${e.stream}] ${e.text}`)
    .join('\n') || '';

  return { code: s.code, components: comps, wiring: wireLines, consoleErrors: consoleLines };
}

export default async function sendMessage(
  content: string,
  mode: AIMode,
  apiKey: string,
  addMessage: (role: AIRole, content: string, mode?: AIMode) => AIMessage,
  appendStreamChunk: (chunk: string) => void,
  finalizeStream: () => void,
  setStreaming: (s: boolean) => void,
  setError: (e: string | null) => void,
) {
  if (!content.trim()) return;

  addMessage('user', content, mode);
  setStreaming(true);

  const { messages } = useAIStore.getState();
  const history = messages.slice(-12).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const ctx = serializeContext();

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      },
      body: JSON.stringify({ messages: history, mode, ...ctx }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError((j as { error?: string }).error ?? `HTTP ${res.status}`);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      appendStreamChunk(decoder.decode(value, { stream: true }));
    }
    finalizeStream();
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Network error');
  }
}
