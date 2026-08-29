import React from 'react';
import { useApp } from '../../context/AppContext';
import { XYBotLogo } from '../common/XYBotLogo';
import { ModeSelector } from '../common/ModeSelector';
import { XY_MODES, XYBotModeId } from '../../constants/modes';
import { 
  Sparkles, 
  ImageIcon, 
  Eye, 
  Mic, 
  Code, 
  ArrowRight, 
  MessageSquare, 
  Clock, 
  Flame, 
  Zap, 
  Lightbulb, 
  Crown,
  Layers,
  GraduationCap,
  Brain
} from 'lucide-react';
import { ActiveView } from '../../types';

export const HomeView: React.FC = () => {
  const { 
    user, 
    chats, 
    selectChat, 
    createNewChat, 
    setActiveView, 
    openPremiumModal,
    activeMode,
    setActiveMode 
  } = useApp();

  const isPremium = user.plan !== 'free';

  const quickActions: { id: ActiveView; title: string; subtitle: string; icon: React.FC<any>; gradient: string; borderColor: string }[] = [
    {
      id: 'image-gen',
      title: 'AI Image Studio',
      subtitle: 'Synthesis & rendering with XY Creative intelligence',
      icon: ImageIcon,
      gradient: 'from-purple-950/50 to-slate-900/80',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
    },
    {
      id: 'vision',
      title: 'Vision & Document OCR',
      subtitle: 'Camera scans, homework math & diagram solving',
      icon: Eye,
      gradient: 'from-cyan-950/50 to-slate-900/80',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
    },
    {
      id: 'voice-chat',
      title: 'Live Voice Matrix',
      subtitle: 'Hands-free conversational neural voice loop',
      icon: Mic,
      gradient: 'from-rose-950/50 to-slate-900/80',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
    },
    {
      id: 'ai-tools',
      title: 'AI Suite Tools',
      subtitle: 'Writing, Code Architect, Math Solver & Translator',
      icon: Code,
      gradient: 'from-amber-950/50 to-slate-900/80',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
    },
  ];

  const modePrompts: { mode: XYBotModeId; label: string; text: string }[] = [
    { mode: 'xy-light', label: 'XY Light', text: 'Give me a fast, 3-bullet executive summary of quantum computing' },
    { mode: 'xy-creative', label: 'XY Creative', text: 'Write an imaginative sci-fi story about an AI rediscovering forgotten starlight' },
    { mode: 'xy-student', label: 'XY Student', text: 'Explain calculus derivatives step-by-step with real-world physics examples' },
    { mode: 'xy-neo', label: 'XY Neo', text: 'Provide a deep architectural breakdown comparing Event-Driven vs Monolithic systems with edge cases' },
    { mode: 'xy-base', label: 'XY Base', text: 'Design an end-to-end strategy for launching an open-source developer tool' },
  ];

  const handleLaunchWithMode = (modeId: XYBotModeId, text?: string) => {
    setActiveMode(modeId);
    createNewChat(text, modeId);
  };

  const dailyTip = {
    title: 'XYBOT Mode Intelligence',
    content: 'Switch to XY Student for step-by-step homework breakdowns, XY Neo for multi-step reasoning, or XY Light for near-instant bullet answers.',
  };

  return (
    <div
      id="home_dashboard_viewport"
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-6xl mx-auto w-full space-y-8"
    >
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 glass border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#00f2ff] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>XYBOT Neural Engine Online</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Greetings, <span className="neon-text">{user.name}</span>
          </h1>

          <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-xl leading-relaxed">
            Welcome to <span className="text-white font-semibold">XYBOT AI</span>. Choose your specialized neural mode or begin exploring below.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => createNewChat()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#7000ff] hover:brightness-110 text-white text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Initialize New Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isPremium && (
              <button
                onClick={openPremiumModal}
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold tracking-wide active:scale-95 transition-all flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-400 fill-current" />
                <span>Upgrade to VIP Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Logo Emblem */}
        <div className="relative z-10 flex-shrink-0 p-3 rounded-2xl neon-border">
          <XYBotLogo size={100} isPremium={isPremium} />
        </div>
      </div>

      {/* Dedicated XYBOT Intelligence Modes Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00f2ff]" />
            <span>XYBOT Engine Modes</span>
          </h3>
          <span className="text-xs text-white/40 font-mono">
            Active: <span className="text-[#00f2ff] font-bold">{XY_MODES[activeMode]?.name}</span>
          </span>
        </div>

        <ModeSelector variant="cards" />
      </div>

      {/* Quick Action Matrix Bento */}
      <div>
        <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#00f2ff]" />
          <span>Core Capabilities</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => setActiveView(action.id)}
                className="p-5 rounded-2xl glass border border-white/10 hover:border-[#00f2ff]/40 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00f2ff] mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#00f2ff] transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed">{action.subtitle}</p>
                </div>

                <div className="mt-4 flex items-center text-xs font-semibold text-[#00f2ff] gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mode-Specific Prompts & Recent Chats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mode Prompts */}
        <div className="p-6 rounded-3xl glass border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Explore Mode Prompts</span>
            </h3>
            <span className="text-[10px] text-[#00f2ff] font-mono">Click to launch in mode</span>
          </div>

          <div className="space-y-2.5">
            {modePrompts.map((mp, idx) => {
              const modeConfig = XY_MODES[mp.mode];
              const ModeIcon = modeConfig.icon;

              return (
                <button
                  key={idx}
                  onClick={() => handleLaunchWithMode(mp.mode, mp.text)}
                  className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#00f2ff]/30 text-left transition-all flex items-start gap-3 group"
                >
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold mt-0.5 flex-shrink-0 flex items-center gap-1 ${modeConfig.bgGlow} ${modeConfig.color} border border-white/10`}>
                    <ModeIcon className="w-3 h-3" />
                    {mp.label}
                  </span>
                  <span className="text-xs text-white/80 group-hover:text-white leading-relaxed flex-1">
                    {mp.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Chats Carousel */}
        <div className="p-6 rounded-3xl glass border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Recent Conversations</span>
              </h3>
              <span className="text-[10px] text-white/40">{chats.length} Total</span>
            </div>

            <div className="space-y-2.5">
              {chats.slice(0, 3).map((chat) => {
                const chatMode = chat.mode ? XY_MODES[chat.mode] : XY_MODES['xy-base'];

                return (
                  <div
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MessageSquare className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 truncate">
                            {chat.title}
                          </h4>
                          {chatMode && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${chatMode.bgGlow} ${chatMode.color}`}>
                              {chatMode.name}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-white/40">
                          {chat.messages.length} messages • {new Date(chat.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily AI Tip footer banner */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 mt-4">
            <Lightbulb className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-[#00f2ff] block">{dailyTip.title}</span>
              <p className="text-[11px] text-white/70 leading-tight mt-0.5">{dailyTip.content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

