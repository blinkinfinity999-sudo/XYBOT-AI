import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { XYBotLogo } from '../common/XYBotLogo';
import { Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck, Zap, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { isLoggedIn, loginAsGuest, loginWithEmail, loginWithGoogle, updateSettings, settings } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [securityPin, setSecurityPin] = useState('1234');

  if (isLoggedIn) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const pinToSave = /^\d{4}$/.test(securityPin) ? securityPin : '1234';
    updateSettings({ passcodeHash: pinToSave });
    loginWithEmail(email, name || undefined);
  };

  const handleGuestLogin = () => {
    updateSettings({ passcodeHash: '1234' });
    loginAsGuest();
  };

  return (
    <div
      id="auth_screen_overlay"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#050505] p-4 overflow-y-auto"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md my-auto p-8 rounded-3xl bg-[#0d0d0d] border border-white/10 shadow-[0_0_60px_rgba(0,242,255,0.1)] relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-2 rounded-2xl neon-border mb-3">
            <XYBotLogo size={56} />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold tracking-widest uppercase text-[#00f2ff] mb-2">
            <Sparkles className="w-3 h-3 text-[#00f2ff]" />
            <span>Next-Gen Neural Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to XYBOT <span className="neon-text">AI</span>
          </h2>
          <p className="text-xs text-white/50 mt-1 max-w-xs">
            Futuristic intelligence with multimodal vision, image synthesis, and voice interaction
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={() => {
            updateSettings({ passcodeHash: '1234' });
            loginWithGoogle();
          }}
          className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 hover:border-white/20 text-white font-medium text-sm flex items-center justify-center gap-3 transition-all shadow-md group"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="group-hover:text-white transition-colors">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-5 gap-3">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">Or with Email</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050505] border border-white/10 focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] text-sm text-white placeholder-white/30 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@xybot.ai"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050505] border border-white/10 focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] text-sm text-white placeholder-white/30 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050505] border border-white/10 focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] text-sm text-white placeholder-white/30 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white/60 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-[#00f2ff]" />
                4-Digit Security PIN
              </label>
              <span className="text-[10px] text-white/40">For plan cancel & app lock</span>
            </div>
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                className="w-full px-4 py-2.5 rounded-xl bg-[#050505] border border-white/10 focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] text-sm text-center font-mono tracking-widest text-white placeholder-white/30 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#7000ff] hover:brightness-110 text-white text-sm font-semibold tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>{mode === 'login' ? 'Sign In to Matrix' : 'Initialize Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode & Guest Mode */}
        <div className="mt-5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-white/50 hover:text-white transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Register" : 'Already have account? Sign in'}
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="text-[#00f2ff] hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Instant Guest Mode</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-white/40">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Session • Sandboxed Intelligence</span>
        </div>
      </motion.div>
    </div>
  );
};
