import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserCheck, 
  ChevronDown, 
  Plus, 
  Check, 
  Settings, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  variant?: 'header' | 'sidebar';
  onOpenProfileModal: () => void;
}

export const ProfileSwitcher: React.FC<Props> = ({ variant = 'header', onOpenProfileModal }) => {
  const { user, profiles, activeProfileId, switchProfile } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'sidebar') {
    return (
      <div ref={dropdownRef} className="relative w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-2.5 transition-all text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-xl object-cover border border-cyan-400/40"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">{user.name}</span>
              </div>
              <p className="text-[10px] text-white/50 truncate">{user.tagline || 'Active Identity'}</p>
            </div>
          </div>

          <ChevronDown className={`w-4 h-4 text-white/40 group-hover:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-2xl bg-[#111118] border border-white/15 shadow-2xl z-50 backdrop-blur-xl"
            >
              <div className="px-2 py-1 mb-1 text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center justify-between">
                <span>Switch Identity ID</span>
                <span className="text-cyan-400">{profiles.length} Total</span>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {profiles.map((prof) => {
                  const isActive = prof.id === activeProfileId;
                  return (
                    <button
                      key={prof.id}
                      onClick={() => {
                        switchProfile(prof.id);
                        setIsOpen(false);
                      }}
                      className={`w-full p-1.5 rounded-xl flex items-center justify-between gap-2 text-left transition-all ${
                        isActive
                          ? 'bg-cyan-500/20 border border-cyan-500/40 text-white'
                          : 'hover:bg-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={prof.avatar}
                          alt={prof.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">{prof.name}</p>
                          {prof.tagline && <p className="text-[9px] text-white/40 truncate">{prof.tagline}</p>}
                        </div>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-white/10 flex gap-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenProfileModal();
                  }}
                  className="w-full py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  <span>Manage / Add IDs</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Header Variant
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all text-left"
        title="Switch User Profile ID"
      >
        <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg overflow-hidden border-2 border-cyan-400/50 p-0.5 flex-shrink-0 relative">
          <img
            src={user.avatar}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-md"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black sm:hidden" />
        </div>
        <div className="hidden sm:flex flex-col text-left pr-1">
          <span className="text-xs font-bold text-white truncate max-w-[90px]">{user.name}</span>
          <span className="text-[9px] text-cyan-400 truncate max-w-[90px]">{user.tagline || 'Profile'}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - fully responsive position avoiding off-screen cuts */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            className="absolute right-[-4px] sm:right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-[290px] sm:w-64 p-2.5 rounded-2xl bg-[#0f0f15] border border-cyan-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-50 backdrop-blur-xl"
          >
            <div className="px-2 py-1 mb-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center justify-between">
              <span>Switch Profile ID</span>
              <span className="text-cyan-400 font-mono">{profiles.length} Active</span>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {profiles.map((prof) => {
                const isActive = prof.id === activeProfileId;
                return (
                  <button
                    key={prof.id}
                    onClick={() => {
                      switchProfile(prof.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2 rounded-xl flex items-center justify-between gap-2.5 text-left transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-white shadow-sm'
                        : 'hover:bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{prof.name}</p>
                        <p className="text-[10px] text-white/40 truncate">{prof.tagline || prof.email}</p>
                      </div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-2 border-t border-white/10 flex flex-col gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfileModal();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manage & Add New Profile</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
