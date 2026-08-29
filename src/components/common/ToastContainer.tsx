import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div
      id="toast_container"
      className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let borderAccent = 'border-cyan-500/40 text-cyan-400';
          let bgGradient = 'from-cyan-950/80 to-slate-900/90';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            borderAccent = 'border-emerald-500/40 text-emerald-400';
            bgGradient = 'from-emerald-950/80 to-slate-900/90';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            borderAccent = 'border-rose-500/40 text-rose-400';
            bgGradient = 'from-rose-950/80 to-slate-900/90';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderAccent = 'border-amber-500/40 text-amber-400';
            bgGradient = 'from-amber-950/80 to-slate-900/90';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r ${bgGradient} backdrop-blur-xl border ${borderAccent} shadow-2xl shadow-black/60`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white tracking-wide">{toast.title}</h4>
                {toast.message && (
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
