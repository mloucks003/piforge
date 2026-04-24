'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Sparkles, Send, Trash2, Bug, Wrench,
  MessageSquare, Loader2, AlertCircle, Wand2, Zap,
} from 'lucide-react';
import { useAIStore, type AIMode } from '@/stores/aiStore';
import { useProjectStore } from '@/stores/projectStore';
import { getComponentDefinition } from '@/lib/components';
import { toast } from '@/stores/toastStore';
import sendMessage from '@/lib/ai/sendMessage';

// ── Build plan types ──────────────────────────────────────────────────────────
interface BuildComponent { ref: string; definitionId: string; }
interface BuildWire { compRef: string; pinId: string; boardPin: number; color: string; }
interface BuildPlan { components: BuildComponent[]; wires: BuildWire[]; code?: string; }

function extractBuildPlan(content: string): BuildPlan | null {
  const match = content.match(/<piforge-build>([\s\S]*?)<\/piforge-build>/);
  if (!match) return null;
  try { return JSON.parse(match[1].trim()) as BuildPlan; } catch { return null; }
}

function stripBuildBlock(content: string): string {
  return content.replace(/<piforge-build>[\s\S]*?<\/piforge-build>/g, '').trim();
}

function executeBuildPlan(plan: BuildPlan): string {
  const uid = () => Math.random().toString(36).slice(2, 9);
  const { addComponent, addWire, boardPosition: bp, boardModel, setCode } = useProjectStore.getState();
  // Clear canvas first
  useProjectStore.setState({ components: {}, wires: {}, breadboards: {}, past: [], future: [] });
  // Place components spaced 80px apart vertically
  const idMap: Record<string, string> = {};
  plan.components.forEach((comp, i) => {
    const def = getComponentDefinition(comp.definitionId);
    if (!def) return;
    const realId = addComponent(def, { x: bp.x + 320, y: bp.y + i * 80 });
    idMap[comp.ref] = realId;
  });
  // Add wires
  for (const wire of plan.wires) {
    const compId = idMap[wire.compRef];
    if (!compId) continue;
    addWire({
      id: uid(), color: wire.color as never, path: [], validated: true, warnings: [],
      startPinRef: { type: 'board', boardId: boardModel, pinNumber: wire.boardPin },
      endPinRef:   { type: 'component', componentId: compId, pinId: wire.pinId },
    });
  }
  // Load code
  if (plan.code) setCode(plan.code);
  return `Built ${plan.components.length} component(s) with ${plan.wires.length} wire(s).`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user';
  // Strip build block before rendering — the button handles execution
  const display = stripBuildBlock(content);
  const formatted = display
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted/60 rounded-lg p-3 text-[11px] font-mono overflow-x-auto my-2 text-foreground whitespace-pre-wrap">$2</pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted/60 rounded px-1 text-[11px] font-mono text-green-400">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${isUser ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'}`}>
        {isUser ? 'U' : 'AI'}
      </div>
      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${isUser ? 'bg-green-600/10 border border-green-600/20 text-foreground' : 'bg-muted/40 border border-border text-foreground'}`}
        dangerouslySetInnerHTML={{ __html: formatted }} />
    </div>
  );
}

// ── Main AIPanel ─────────────────────────────────────────────────────────────

const MODE_META: Record<AIMode, { icon: React.ElementType; label: string; placeholder: string; buttonLabel: string }> = {
  chat:     { icon: MessageSquare, label: 'Chat',     placeholder: 'Ask anything about your circuit or code…', buttonLabel: 'Ask' },
  analyze:  { icon: Bug,           label: 'Analyze',  placeholder: 'Ask about code quality, logic, or best practices…', buttonLabel: 'Analyze Code' },
  fix:      { icon: Wrench,        label: 'Fix',      placeholder: 'Describe the problem or click Fix to auto-detect from console errors…', buttonLabel: 'Auto-Fix' },
  generate: { icon: Wand2,         label: 'Generate', placeholder: 'Describe what you want to build, e.g. "a servo that sweeps left-right when a button is pressed"…', buttonLabel: 'Generate Project' },
};

export default function AIPanel() {
  const { messages, streaming, streamingContent, serverHasKey, activeMode, error,
    setActiveMode, addMessage, appendStreamChunk, finalizeStream,
    setStreaming, setError, clearMessages, checkServerKey } = useAIStore();

  const [input, setInput] = useState('');
  const [pendingBuild, setPendingBuild] = useState<BuildPlan | null>(null);
  const prevStreaming = useRef(false);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { checkServerKey(); }, [checkServerKey]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, streamingContent]);

  // Detect when streaming just finished — check the last AI message for a build plan
  useEffect(() => {
    if (prevStreaming.current && !streaming) {
      const last = messages[messages.length - 1];
      if (last?.role === 'assistant') {
        const plan = extractBuildPlan(last.content);
        if (plan) setPendingBuild(plan);
      }
    }
    prevStreaming.current = streaming;
  }, [streaming, messages]);

  const handleBuild = useCallback(() => {
    if (!pendingBuild) return;
    try {
      const summary = executeBuildPlan(pendingBuild);
      toast.success(`✨ Circuit built! ${summary} Code loaded in Editor.`, { duration: 4000 });
      setPendingBuild(null);
    } catch (e) {
      toast.error('Build failed — ' + (e instanceof Error ? e.message : 'unknown error'));
    }
  }, [pendingBuild]);

  const send = async (overrideContent?: string) => {
    if (streaming) return;
    let content = overrideContent ?? input.trim();
    if (!content) {
      if (activeMode === 'analyze') content = 'Please analyze my current code and circuit for issues and improvements.';
      else if (activeMode === 'fix') content = 'Please diagnose the errors in the console output and provide fixed code.';
      else return;
    }
    setInput('');
    // Pass empty string — server uses its own OPENAI_API_KEY env var
    await sendMessage(content, activeMode, '', addMessage, appendStreamChunk, finalizeStream, setStreaming, setError);
  };

  const meta = MODE_META[activeMode];
  const Icon = meta.icon;

  // While we haven't confirmed the server key yet, show a subtle connecting state
  const isReady = serverHasKey !== false;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20 shrink-0">
        <Sparkles className="h-4 w-4 text-purple-400" />
        <span className="text-xs font-semibold text-foreground flex-1">PiForge AI</span>
        {serverHasKey === null ? (
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Connecting…
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[9px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Ready
          </span>
        )}
        <button onClick={clearMessages} className="p-1 rounded hover:bg-accent transition-colors" title="Clear conversation">
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex shrink-0 border-b border-border">
        {(Object.keys(MODE_META) as AIMode[]).map((m) => {
          const MIcon = MODE_META[m].icon;
          return (
            <button key={m} onClick={() => setActiveMode(m)}
              className={`flex flex-1 items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors border-b-2 ${activeMode === m ? 'border-purple-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <MIcon className="h-3 w-3" />{MODE_META[m].label}
            </button>
          );
        })}
      </div>

      {/* Mode description */}
      <div className="shrink-0 px-3 py-2 bg-purple-500/5 border-b border-border">
        <p className="text-[10px] text-muted-foreground">
          {activeMode === 'chat' && 'Ask anything about GPIO, Python, your circuit, or components.'}
          {activeMode === 'analyze' && 'AI reviews your code for bugs, bad patterns, and GPIO misuse — using your actual code and wiring as context.'}
          {activeMode === 'fix' && 'AI reads the console errors and your code to generate a corrected version.'}
          {activeMode === 'generate' && 'Describe what you want to build — AI generates complete working code, a wiring guide, and a components list.'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
            <Sparkles className="h-8 w-8 text-purple-400/50" />
            <p className="text-xs font-medium text-muted-foreground">
              {activeMode === 'chat'     ? 'Ask me anything about your circuit or code.'     :
               activeMode === 'analyze' ? 'Click Analyze Code to get a full review.'         :
               activeMode === 'generate'? 'Describe what you want to build and click Generate.' :
                                          'Click Auto-Fix to diagnose errors from the console.'}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {streaming && streamingContent && (
          <MessageBubble role="assistant" content={streamingContent + '▋'} />
        )}

        {streaming && !streamingContent && (
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">AI</div>
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-400">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Build on Canvas button — appears when AI returns a build plan */}
      {pendingBuild && !streaming && (
        <div className="shrink-0 px-3 pb-2">
          <button onClick={handleBuild}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold bg-green-600 hover:bg-green-500 text-white transition-colors shadow-lg shadow-green-900/30">
            <Zap className="h-3.5 w-3.5" />
            ✨ Build Circuit on Canvas
          </button>
          <p className="text-[9px] text-muted-foreground text-center mt-1">
            Clears canvas and places {pendingBuild.components.length} component(s) + wires + code
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 border-t border-border p-3 space-y-2">
        {(activeMode === 'analyze' || activeMode === 'fix' || activeMode === 'generate') && (
          <button onClick={() => send(undefined)} disabled={streaming || !isReady || (activeMode === 'generate' && !input.trim())}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${activeMode === 'analyze' ? 'bg-blue-600 hover:bg-blue-500 text-white' : activeMode === 'generate' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}>
            {streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
            {meta.buttonLabel}
          </button>
        )}
        <div className="flex gap-2 items-end">
          <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={isReady ? meta.placeholder : 'Connecting to AI…'} rows={2} disabled={streaming || !isReady}
            className="flex-1 resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 placeholder:text-muted-foreground" />
          <button onClick={() => send()} disabled={!input.trim() || streaming || !isReady}
            className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground text-center">
          Your code, wiring &amp; console are sent as context · Powered by GPT-4o
        </p>
      </div>
    </div>
  );
}
