import React from 'react';
import { useApp } from '../../context/AppContext';
import { Keyboard, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setShortcutsOpen } = useApp();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'Ctrl / ⌘ + N', action: 'Create New Conversation' },
    { key: 'Ctrl / ⌘ + K', action: 'Quick Search Chats' },
    { key: 'Ctrl / ⌘ + B', action: 'Toggle Sidebar' },
    { key: 'Ctrl / ⌘ + /', action: 'Show Keyboard Shortcuts' },
    { key: 'Shift + Enter', action: 'New Line in Chat Box' },
    { key: 'Enter', action: 'Send Message' },
    { key: 'Esc', action: 'Close Active Modals' },
  ];

  return (
    <div
      id="shortcuts_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#00f2ff]">
            <Keyboard className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-wide">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={() => setShortcutsOpen(false)}
            className="text-white/40 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-2xl glass border border-white/10"
            >
              <span className="text-sm text-white/80">{sc.action}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-[#00f2ff] bg-white/5 border border-white/10 rounded-lg shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/40 text-center mt-5">
          Press <kbd className="text-white/60">Esc</kbd> anytime to dismiss.
        </p>
      </motion.div>
    </div>
  );
};
