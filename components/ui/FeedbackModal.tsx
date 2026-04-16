'use client';

import { useState } from 'react';
import { X, Bug, Lightbulb, MessageSquare, Send, CheckCircle2, Copy } from 'lucide-react';
import { useFeedbackStore } from '@/stores/feedbackStore';

const LIFETIME_CODE = 'EARLYADOPTER';

type FeedbackType = 'bug' | 'feature' | 'general';

const TYPE_CONFIG: Record<FeedbackType, { icon: React.ReactNode; label: string; color: string }> = {
  bug:     { icon: <Bug className="h-4 w-4" />,           label: 'Bug Report',       color: 'border-red-500/50 bg-red-500/10 text-red-400' },
  feature: { icon: <Lightbulb className="h-4 w-4" />,     label: 'Feature Request',  color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' },
  general: { icon: <MessageSquare className="h-4 w-4" />, label: 'General Feedback', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
};

export default function FeedbackModal() {
  const { open, closeModal } = useFeedbackStore();
  const [type, setType]       = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setSendError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, senderEmail: email || undefined, senderName: email || undefined }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) { setSendError(data.error ?? 'Failed to send. Please try again.'); setSending(false); return; }
    } catch {
      setSendError('Network error. Please try again.');
      setSending(false);
      return;
    }
    setSending(false);
    setSubmitted(true);
  }

  function copyCode() {
    navigator.clipboard.writeText(LIFETIME_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleClose() {
    closeModal();
    setTimeout(() => { setSubmitted(false); setMessage(''); setEmail(''); setType('general'); }, 300);
  }

  return (
    <div className="fixed inset-0 z-[60000] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-foreground">Send Feedback</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Help us improve PiForge — valid feedback earns a lifetime license</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {submitted ? (
          /* Thank-you screen */
          <div className="px-5 py-8 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">Thank you! 🎉</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your feedback has been recorded and an email draft opened in your mail app.
                As a thank-you, here&apos;s your <strong className="text-foreground">lifetime Pro access code</strong>:
              </p>
            </div>
            <div className="w-full rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3">
              <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-1">Lifetime License Code</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold font-mono text-green-300 tracking-widest">{LIFETIME_CODE}</span>
                <button onClick={copyCode}
                  className="flex items-center gap-1.5 rounded-lg border border-green-500/40 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/10 transition-colors">
                  <Copy className="h-3 w-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Enter this code in your profile → Promo Code to activate lifetime Pro access.
            </p>
            <button onClick={handleClose}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors">
              Back to Lab
            </button>
          </div>
        ) : (
          /* Feedback form */
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            {/* Type picker */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(TYPE_CONFIG) as FeedbackType[]).map(t => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all ${type === t ? TYPE_CONFIG[t].color : 'border-border text-muted-foreground hover:border-border/80 hover:bg-accent'}`}>
                    {TYPE_CONFIG[t].icon}
                    <span className="text-[10px] leading-tight text-center">{TYPE_CONFIG[t].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                {type === 'bug' ? 'What happened? (steps to reproduce help!)' : type === 'feature' ? 'Describe the feature you\'d like' : 'Your feedback'}
              </label>
              <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={4}
                placeholder={type === 'bug' ? 'e.g. When I click Run with the DHT22 wired, the console shows...' : type === 'feature' ? 'e.g. It would be great if I could...' : 'Tell us what you think...'}
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/60 resize-none transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Your email (optional — for follow-up)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            {sendError && <p className="text-red-400 text-[11px]">{sendError}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={handleClose}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={!message.trim() || sending}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Send className="h-3.5 w-3.5" /> {sending ? 'Sending…' : 'Submit & Get Lifetime Code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
