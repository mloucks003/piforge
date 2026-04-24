'use client';

import { useState, useEffect } from 'react';
import { X, Cpu, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { useAuthStore, type ModalTab } from '@/stores/authStore';

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free:      { label: 'Free',      color: 'bg-muted text-muted-foreground' },
  pro:       { label: 'Pro',       color: 'bg-blue-600 text-white' },
  education: { label: 'Education', color: 'bg-purple-600 text-white' },
};

export default function AuthModal() {
  const { modalOpen, modalTab, user, closeModal, openModal, signIn, signUp, applyPromo, signOut } = useAuthStore();
  const [tab, setTab] = useState<ModalTab>(modalTab);
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [promo, setPromo]       = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  // Sync tab when store changes (e.g. openModal('signin'))
  useEffect(() => { setTab(modalTab); setError(''); setSuccess(''); }, [modalTab, modalOpen]);

  if (!modalOpen) return null;

  const reset = () => { setError(''); setSuccess(''); };
  const changeTab = (t: ModalTab) => { setTab(t); reset(); };

  const handleSignIn = async () => {
    setLoading(true); reset();
    const res = signIn(email, password);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? 'Sign in failed.'); return; }
    // Best-effort: record sign-in in Supabase for existing users who weren't captured at signup
    const u = useAuthStore.getState().user;
    if (u) {
      fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: u.email, name: u.name }),
      }).catch(() => {});
    }
  };

  const handleSignUp = async () => {
    setLoading(true); reset();
    const res = signUp(email, name, password);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? 'Sign up failed.'); return; }
    setSuccess('Account created! You\'re signed in.');
    // Fire-and-forget: record signup in Supabase (fails silently if DB not configured)
    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim() }),
    }).catch(() => { /* ignore — DB logging is best-effort */ });
  };

  const handlePromo = () => {
    reset();
    const res = applyPromo(promo);
    if (!res.ok) setError(res.error ?? 'Invalid code.');
    else setSuccess(`🎉 Unlocked! You now have ${useAuthStore.getState().user?.plan?.toUpperCase()} access.`);
  };

  const planInfo = user ? PLAN_LABELS[user.plan] : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-border bg-background shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Cpu className="h-5 w-5 text-green-500" />
            <span>PiForge</span>
          </div>
          {planInfo && (
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${planInfo.color}`}>
              {planInfo.label}
            </span>
          )}
          <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* If signed in: show account info */}
        {user ? (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto text-2xl font-bold text-green-400">
                {user.name[0].toUpperCase()}
              </div>
              <p className="font-semibold text-lg mt-3">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 ${PLAN_LABELS[user.plan].color}`}>
                {PLAN_LABELS[user.plan].label} Plan
              </span>
            </div>
            {user.plan === 'free' && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-sm space-y-2">
                <p className="font-semibold text-blue-400 flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Upgrade to Pro</p>
                <p className="text-muted-foreground text-xs">Get all components, 18+ projects, sensor controls, and the pygame touchscreen for $9/month.</p>
                <div className="flex gap-2">
                  <input value={promo} onChange={e => setPromo(e.target.value)} placeholder='Enter promo code e.g. "testdev"'
                    className="flex-1 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <button onClick={handlePromo} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors">Apply</button>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                {success && <p className="text-green-400 text-xs">{success}</p>}
              </div>
            )}
            <button onClick={signOut} className="w-full rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              Sign Out
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up / Promo tabs */
          <div>
            <div className="flex border-b border-border">
              {(['signup', 'signin', 'promo'] as ModalTab[]).map((t) => (
                <button key={t} onClick={() => changeTab(t)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === t ? 'border-b-2 border-green-500 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {t === 'signup' ? 'Sign Up' : t === 'signin' ? 'Sign In' : 'Promo Code'}
                </button>
              ))}
            </div>
            <div className="p-6 space-y-4">
              {tab === 'promo' ? (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <Lock className="h-8 w-8 text-blue-400 mx-auto" />
                    <p className="font-semibold">Enter a promo code</p>
                    <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 py-0.5 rounded text-green-400">testdev</code> to unlock all Pro features instantly.</p>
                  </div>
                  <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Promo code"
                    className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={e => e.key === 'Enter' && handlePromo()} />
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  {success && <p className="text-green-400 text-xs flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />{success}</p>}
                  <button onClick={handlePromo} className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
                    Unlock Access
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Migration notice — shown only on sign-in tab */}
                  {tab === 'signin' && (
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2.5 text-xs text-yellow-300 leading-relaxed">
                      <strong className="text-yellow-200">⚠️ Platform upgrade:</strong> We moved to a real database on April 24, 2025. If your old login doesn&apos;t work, please{' '}
                      <button onClick={() => changeTab('signup')} className="underline text-yellow-200 hover:text-white font-semibold">
                        create a new account
                      </button>
                      {' '}— it only takes 30 seconds. Sorry for the inconvenience!
                    </div>
                  )}
                  {tab === 'signup' && (
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                      className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  )}
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
                    className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
                    className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyDown={e => e.key === 'Enter' && (tab === 'signin' ? handleSignIn() : handleSignUp())} />
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  {success && <p className="text-green-400 text-xs flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />{success}</p>}
                  <button onClick={tab === 'signin' ? handleSignIn : handleSignUp} disabled={loading}
                    className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-500 transition-colors disabled:opacity-50">
                    {loading ? 'Loading…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    {tab === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                    <button onClick={() => changeTab(tab === 'signup' ? 'signin' : 'signup')} className="text-green-400 hover:underline">
                      {tab === 'signup' ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                  <div className="border-t border-border pt-3 text-center">
                    <button onClick={() => changeTab('promo')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto">
                      <Sparkles className="h-3 w-3" /> Have a promo code?
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
