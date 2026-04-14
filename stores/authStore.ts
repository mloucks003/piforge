'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Plan = 'free' | 'pro' | 'education';
export type ModalTab = 'signin' | 'signup' | 'promo';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: Plan;
}

// Stored accounts (client-side only — no real backend)
interface StoredAccount {
  id: string;
  email: string;
  name: string;
  password: string; // plain-text: no real backend, demo only
  plan: Plan;
}

interface AuthState {
  user: AuthUser | null;
  accounts: StoredAccount[];
  modalOpen: boolean;
  modalTab: ModalTab;
  // Actions
  signUp: (email: string, name: string, password: string) => { ok: boolean; error?: string };
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;
  applyPromo: (code: string) => { ok: boolean; error?: string };
  openModal: (tab?: ModalTab) => void;
  closeModal: () => void;
  upgradePlan: (plan: Plan) => void;
}

const PROMO_CODES: Record<string, Plan> = {
  testdev: 'pro',
  TESTDEV: 'pro',
  edu2025: 'education',
  EDU2025: 'education',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: [],
      modalOpen: false,
      modalTab: 'signup',

      signUp: (email, name, password) => {
        const norm = email.trim().toLowerCase();
        const { accounts } = get();
        if (!norm || !name.trim() || !password) {
          return { ok: false, error: 'All fields are required.' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) {
          return { ok: false, error: 'Please enter a valid email address.' };
        }
        if (password.length < 6) {
          return { ok: false, error: 'Password must be at least 6 characters.' };
        }
        if (accounts.find((a) => a.email === norm)) {
          return { ok: false, error: 'An account with this email already exists.' };
        }
        const id = `user_${Date.now()}`;
        const account: StoredAccount = { id, email: norm, name: name.trim(), password, plan: 'free' };
        const user: AuthUser = { id, email: norm, name: name.trim(), plan: 'free' };
        set((s) => ({ accounts: [...s.accounts, account], user, modalOpen: false }));
        return { ok: true };
      },

      signIn: (email, password) => {
        const norm = email.trim().toLowerCase();
        const { accounts } = get();
        const account = accounts.find((a) => a.email === norm);
        if (!account) return { ok: false, error: 'No account found with that email.' };
        if (account.password !== password) return { ok: false, error: 'Incorrect password.' };
        const user: AuthUser = { id: account.id, email: account.email, name: account.name, plan: account.plan };
        set({ user, modalOpen: false });
        return { ok: true };
      },

      signOut: () => set({ user: null }),

      applyPromo: (code) => {
        const plan = PROMO_CODES[code.trim()];
        if (!plan) return { ok: false, error: 'Invalid promo code. Try "testdev" for full access.' };
        const { user, accounts } = get();
        // If signed in, upgrade their stored account too
        const updatedAccounts = accounts.map((a) =>
          user && a.id === user.id ? { ...a, plan } : a
        );
        const updatedUser = user ? { ...user, plan } : { id: `guest_${Date.now()}`, email: 'guest@piforge.dev', name: 'Guest (Promo)', plan };
        set({ user: updatedUser, accounts: updatedAccounts, modalOpen: false });
        return { ok: true };
      },

      openModal: (tab = 'signup') => set({ modalOpen: true, modalTab: tab }),
      closeModal: () => set({ modalOpen: false }),
      upgradePlan: (plan) => {
        const { user, accounts } = get();
        if (!user) return;
        const updatedAccounts = accounts.map((a) => (a.id === user.id ? { ...a, plan } : a));
        set({ user: { ...user, plan }, accounts: updatedAccounts });
      },
    }),
    {
      name: 'piforge-auth',
      partialize: (s) => ({ user: s.user, accounts: s.accounts }),
    }
  )
);

export const isPro = (user: AuthUser | null): boolean =>
  user?.plan === 'pro' || user?.plan === 'education';
