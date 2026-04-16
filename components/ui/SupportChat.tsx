'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

type Stage = 'idle' | 'open' | 'sent';

interface Msg { from: 'team' | 'user'; text: string; }

const WELCOME: Msg[] = [
  {
    from: 'team',
    text: "👋 Hey! Welcome to PiForge support.",
  },
  {
    from: 'team',
    text: "⚠️ Note: this is our human support chat — not the circuit AI. For help building boards or running code, use the AI tab inside the lab.",
  },
  {
    from: 'team',
    text: "Ask us anything — bugs, feedback, billing, or general questions. Leave your email and we'll reply within 24 hours!",
  },
];

export default function SupportChat() {
  const [stage, setStage]     = useState<Stage>('idle');
  const [msgs, setMsgs]       = useState<Msg[]>(WELCOME);
  const [input, setInput]     = useState('');
  const [email, setEmail]     = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');
  const bottomRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMsgs(m => [...m, { from: 'user', text: userMsg }]);
    setInput('');
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Support Chat',
          message: userMsg,
          senderEmail: email || undefined,
          senderName: email || 'Anonymous',
        }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? 'Failed');
      setMsgs(m => [...m, {
        from: 'team',
        text: email
          ? `Got it! We'll reply to ${email} within 24 hours. 🙏`
          : "Got it! Drop your email below if you'd like a reply — otherwise we'll look into it. 🙏",
      }]);
      setStage('sent');
    } catch {
      setError('Failed to send — please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* Chat window */}
      {stage !== 'idle' && (
        <div className="fixed bottom-20 right-4 z-[55000] flex flex-col w-80 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
          style={{ maxHeight: '460px' }}>

          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-blue-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageCircle className="h-5 w-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 border border-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">PiForge Support</p>
                <p className="text-[10px] text-blue-200 leading-none mt-0.5">Typically replies within 24h</p>
              </div>
            </div>
            <button onClick={() => setStage('idle')} className="p-1 rounded-lg hover:bg-blue-500 transition-colors">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* NOT THE AI banner */}
          <div className="flex items-center gap-2 bg-yellow-500/10 border-b border-yellow-500/20 px-3 py-1.5">
            <Bot className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
            <p className="text-[10px] text-yellow-300 leading-snug">
              <strong>This is human support</strong>, not the circuit AI. For code/board help, use the <strong>AI tab</strong> in the lab.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0" style={{ maxHeight: '220px' }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3 space-y-2">
            {!email && stage !== 'sent' && (
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email for a reply (optional)"
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/60 transition-colors"
              />
            )}
            {stage !== 'sent' && (
              <>
                {error && <p className="text-red-400 text-[10px]">{error}</p>}
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    rows={2}
                    placeholder="Type a message… (Enter to send)"
                    className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/60 resize-none transition-colors"
                  />
                  <button onClick={send} disabled={!input.trim() || sending}
                    className="flex items-center justify-center rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
            {stage === 'sent' && (
              <button onClick={() => { setStage('idle'); setMsgs(WELCOME); setInput(''); setEmail(''); }}
                className="w-full rounded-lg border border-border py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors">
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating bubble button */}
      <button
        onClick={() => setStage(s => s === 'idle' ? 'open' : 'idle')}
        className="fixed bottom-4 right-4 z-[55000] flex h-13 w-13 items-center justify-center rounded-full bg-blue-600 shadow-lg hover:bg-blue-500 transition-all hover:scale-105 active:scale-95"
        title="Chat with PiForge support"
        style={{ height: 52, width: 52 }}
      >
        {stage !== 'idle'
          ? <X className="h-5 w-5 text-white" />
          : <MessageCircle className="h-5 w-5 text-white" />
        }
        {stage === 'idle' && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-background animate-pulse" />
        )}
      </button>
    </>
  );
}
