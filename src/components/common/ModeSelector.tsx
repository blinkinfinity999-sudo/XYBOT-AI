import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { XY_MODES, XYBotModeId } from '../../constants/modes';
import { 
  ChevronDown, 
  Check, 
  Sparkles, 
  Zap, 
  Cpu, 
  GraduationCap, 
  Brain, 
  Layers,
  Flame,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  variant?: 'header' | 'compact' | 'cards' | 'banner';
  onSelect?: (modeId: XYBotModeId) => void;
  className?: string;
}

export const ModeSelector: React.FC<Props> = ({ 
  variant = 'header', 
  onSelect,
  className = '' 
}) => {
  const { activeMode, setActiveMode, currentChat, setChatMode } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<XYBotModeId | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = XY_MODES[activeMode] || XY_MODES['xy-base'];
  const CurrentIcon = currentConfig.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMode = (modeId: XYBotModeId) => {
    setActiveMode(modeId);
    if (currentChat) {
      setChatMode(currentChat.id, modeId);
    }
    if (onSelect) {
      onSelect(modeId);
    }
    setIsOpen(false);
  };

  // 1. CARDS VARIANT (for Home View and Modal View)
  if (variant === 'cards') {
    return (
      <div id="xybot_mode_cards_grid" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 w-full ${className}`}>
        {Object.values(XY_MODES).map((mode) => {
          const Icon = mode.icon;
          const isSelected = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => handleSelectMode(mode.id)}
              className={`relative text-left p-4 rounded-2xl transition-all flex flex-col justify-between group overflow-hidden border ${
                isSelected
                  ? `bg-slate-900/90 border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.15)] ring-1 ring-[#00f2ff]/50`
                  : `bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-900/60`
              }`}
            >
              {/* Subtle top gradient accent */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mode.gradient} opacity-80`} 
              />

              <div>
                {/* Header with Icon and Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${mode.bgGlow} ${mode.color} border border-white/10`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isSelected ? 'bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40' : 'bg-white/5 text-white/50'
                  }`}>
                    {mode.badge}
                  </span>
                </div>

                {/* Name and Tagline */}
                <h4 className="text-sm font-bold text-white group-hover:text-[#00f2ff] transition-colors flex items-center gap-1.5">
                  {mode.name}
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#00f2ff]" />}
                </h4>
                <p className="text-[11px] text-white/50 font-medium mt-0.5 line-clamp-1">{mode.tagline}</p>
                <p className="text-xs text-white/60 mt-2 line-clamp-2 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              {/* Bottom Specs / Ratings */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                <span className="flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Speed: {mode.speedRating}/5
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Brain className="w-3 h-3 text-purple-400" />
                  Logic: {mode.reasoningRating}/5
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. BANNER VARIANT (Inline mode picker strip)
  if (variant === 'banner') {
    return (
      <div className={`flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-x-auto no-scrollbar ${className}`}>
        {Object.values(XY_MODES).map((mode) => {
          const Icon = mode.icon;
          const isSelected = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => handleSelectMode(mode.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-[#00f2ff]/20 to-[#7000ff]/20 text-white border border-[#00f2ff]/50 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${mode.color}`} />
              <span>{mode.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 3. HEADER DROPDOWN VARIANT (Default)
  return (
    <div id="xybot_mode_selector_dropdown" ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00f2ff]/40 text-xs font-semibold text-white transition-all shadow-sm active:scale-95 group"
        title="Switch XYBOT AI Mode"
      >
        <span className={`w-2 h-2 rounded-full ${currentConfig.color} shadow-[0_0_8px_currentColor]`} />
        <CurrentIcon className={`w-3.5 h-3.5 ${currentConfig.color}`} />
        <span className="font-bold text-white tracking-wide">{currentConfig.name}</span>
        <span className="text-[10px] text-white/50 hidden lg:inline font-normal">({currentConfig.badge})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 group-hover:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-80 sm:w-96 p-2 rounded-2xl bg-[#0a0a0f] border border-white/15 shadow-2xl z-50 backdrop-blur-2xl"
          >
            {/* Header info */}
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" />
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                  XYBOT AI Engine Modes
                </span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">Select Active Mode</span>
            </div>

            {/* List of 5 Modes */}
            <div className="py-1.5 space-y-1 max-h-[380px] overflow-y-auto">
              {Object.values(XY_MODES).map((mode) => {
                const Icon = mode.icon;
                const isSelected = activeMode === mode.id;

                return (
                  <button
                    key={mode.id}
                    onClick={() => handleSelectMode(mode.id)}
                    onMouseEnter={() => setHoveredMode(mode.id)}
                    onMouseLeave={() => setHoveredMode(null)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-start gap-3 transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#00f2ff]/15 to-[#7000ff]/15 border-[#00f2ff]/40 text-white'
                        : 'border-transparent hover:bg-white/5 text-white/70 hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${mode.bgGlow} ${mode.color} border border-white/10`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{mode.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                            isSelected ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 'bg-white/10 text-white/50'
                          }`}>
                            {mode.badge}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#00f2ff]" />}
                      </div>

                      <p className="text-[11px] text-white/80 font-medium mt-0.5">{mode.tagline}</p>
                      <p className="text-[10px] text-white/50 mt-1 line-clamp-2 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer tip */}
            <div className="px-3 py-2 border-t border-white/10 bg-white/[0.02] rounded-b-xl flex items-center justify-between text-[10px] text-white/40">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-[#00f2ff]" />
                Mode adapts reasoning, speed & system instructions
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
