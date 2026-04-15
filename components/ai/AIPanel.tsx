'use client';

import { useRef, useEffect, useState } from 'react';
import {
  Sparkles, Send, Trash2, Settings, Bug, Wrench,
  MessageSquare, Loader2, AlertCircle, Key, Wand2,
} from 'lucide-react';
import { useAIStore, type AIMode } from '@/stores/aiStore';
import sendMessage from '@/lib/ai/sendMessage';

// ── Sub-components ───────────────────────────────────────────────────────────

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user';
  // Minimal markdown: code blocks, bold
  const formatted = content
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

function ApiKeySettings({ onClose }: { onClose: () => void }) {
  const { apiKey, setApiKey } = useAIStore();
  const [val, setVal] = useState(apiKey);
  return (
    <div className="p-4 space-y-3 border-b border-border bg-muted/20">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Key className="h-4 w-4 text-yellow-400" /> OpenAI API Key
      </div>
      <p className="text-[11px] text-muted-foreground">
        Enter your <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-400 underline">OpenAI API key</a> to enable AI features. Stored locally — never sent to our servers.
      </p>
      <div className="flex gap-2">
        <input type="password" value={val} onChange={e => setVal(e.target.value)}
          placeholder="sk-..." className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-green-500" />
        <button onClick={() => { setApiKey(val); onClose(); }}
          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-500 transition-colors">Save</button>
      </div>
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
  const { messages, streaming, streamingContent, apiKey, serverHasKey, activeMode, error,
    setActiveMode, addMessage, appendStreamChunk, finalizeStream,
    setStreaming, setError, clearMessages, checkServerKey } = useAIStore();

  const [input, setInput] = useState('');
  // Only show settings if server has no key AND user has no key
  const needsKey = serverHasKey === false && !apiKey;
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if server has a key configured (runs once)
  useEffect(() => { checkServerKey(); }, [checkServerKey]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, streamingContent]);

  const send = async (overrideContent?: string) => {
    if (streaming) return;
    let content = overrideContent ?? input.trim();
    if (!content) {
      // Default prompts for one-click modes
      if (activeMode === 'analyze') content = 'Please analyze my current code and circuit for issues and improvements.';
      else if (activeMode === 'fix') content = 'Please diagnose the errors in the console output and provide fixed code.';
      else return;
    }
    setInput('');
    await sendMessage(content, activeMode, apiKey, addMessage, appendStreamChunk, finalizeStream, setStreaming, setError);
  };

  const meta = MODE_META[activeMode];
  const Icon = meta.icon;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20 shrink-0">
        <Sparkles className="h-4 w-4 text-purple-400" />
        <span className="text-xs font-semibold text-foreground flex-1">PiForge AI</span>
        {/* Show "Ready" badge when server has key, otherwise show settings gear */}
        {serverHasKey ? (
          <span className="flex items-center gap-1 text-[9px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Ready
          </span>
        ) : (
          <button onClick={() => setShowSettings(v => !v)} className="p-1 rounded hover:bg-accent transition-colors" title="API Key Settings">
            <Settings className={`h-3.5 w-3.5 ${needsKey ? 'text-yellow-400' : 'text-muted-foreground'}`} />
          </button>
        )}
        <button onClick={clearMessages} className="p-1 rounded hover:bg-accent transition-colors" title="Clear conversation">
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Only show key settings if server has no key */}
      {showSettings && !serverHasKey && <ApiKeySettings onClose={() => setShowSettings(false)} />}

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
          {activeMode === 'fix' && 'AI reads the console errors and your code to generate a corrected version. Click the button below to auto-fix.'}
          {activeMode === 'generate' && 'Describe what you want to build — AI generates complete working Python code, a wiring guide, and a components list.'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
            <Sparkles className="h-8 w-8 text-purple-400/50" />
            <p className="text-xs font-medium text-muted-foreground">
              {activeMode === 'chat' ? 'Ask me anything about your circuit or code.' :
               activeMode === 'analyze' ? 'Click Analyze Code to get a full review.' :
               activeMode === 'generate' ? 'Describe what you want to build and click Generate.' :
               'Click Auto-Fix to diagnose errors from the console.'}
            </p>
            {needsKey && (
              <button onClick={() => setShowSettings(true)} className="text-[11px] text-yellow-400 underline">
                ⚠ Add your OpenAI API key to get started
              </button>
            )}
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

      {/* Input area */}
      <div className="shrink-0 border-t border-border p-3 space-y-2">
        {/* Quick action for analyze/fix/generate */}
        {(activeMode === 'analyze' || activeMode === 'fix' || activeMode === 'generate') && (
          <button onClick={() => send(undefined)} disabled={streaming || (activeMode === 'generate' && !input.trim())}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${activeMode === 'analyze' ? 'bg-blue-600 hover:bg-blue-500 text-white' : activeMode === 'generate' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}>
            {streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
            {meta.buttonLabel}
          </button>
        )}
        <div className="flex gap-2 items-end">
          <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={meta.placeholder} rows={2} disabled={streaming}
            className="flex-1 resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 placeholder:text-muted-foreground" />
          <button onClick={() => send()} disabled={!input.trim() || streaming}
            className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground text-center">
          {serverHasKey
            ? 'Your code, wiring & console are sent as context · Powered by GPT-4o mini'
            : apiKey
              ? 'Using your API key · Code, wiring & console sent as context'
              : 'Add an API key above to enable AI features'}
        </p>
      </div>
    </div>
  );
}
