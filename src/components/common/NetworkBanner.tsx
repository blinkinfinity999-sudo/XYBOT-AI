import React from 'react';
import { useApp } from '../../context/AppContext';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NetworkBanner: React.FC = () => {
  const { isOnline } = useApp();

  if (isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="network_offline_banner"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-gradient-to-r from-amber-600/90 via-rose-600/90 to-amber-600/90 text-white px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg z-40 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
          <span>Offline mode active. Chat caching is active, but internet connection is required for live neural responses.</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-xs font-semibold tracking-wide transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
