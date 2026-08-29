import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { XYBotLogo } from './XYBotLogo';
import { ModeSelector } from './ModeSelector';
import { 
  Menu, 
  Plus, 
  Sparkles, 
  Crown, 
  Share2, 
  FileDown, 
  Keyboard
} from 'lucide-react';
import { exportChatToPdf } from '../../lib/exportPdf';
import { ProfileSwitcher } from '../profile/ProfileSwitcher';

export const Header: React.FC = () => {
  const { 
    toggleSidebar, 
    createNewChat, 
    openPremiumModal, 
    user, 
    currentChat, 
    setActiveView, 
    showToast,
    setShortcutsOpen
  } = useApp();

  const isPremium = user.plan !== 'free';

  const handleShareChat = () => {
    if (!currentChat || currentChat.messages.length === 0) {
      showToast({ type: 'warning', title: 'Empty Chat', message: 'Send a message first before sharing.' });
      return;
    }
    const textToCopy = currentChat.messages
      .map((m) => `${m.role === 'user' ? user.name : 'XYBOT AI'}:\n${m.content}\n`)
      .join('\n---\n\n');
    navigator.clipboard.writeText(textToCopy);
    showToast({ type: 'success', title: 'Chat Copied to Clipboard', message: 'Formatted transcript ready to share.' });
  };

  const handleExportPdf = () => {
    if (!currentChat || currentChat.messages.length === 0) {
      showToast({ type: 'warning', title: 'Empty Chat', message: 'Send a message first before exporting.' });
      return;
    }
    exportChatToPdf(currentChat, user.name);
    showToast({ type: 'success', title: 'PDF Exported', message: 'Transcript downloaded successfully.' });
  };

  return (
    <header
      id="main_app_header"
      className="sticky top-0 z-30 w-full h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-3 sm:px-6 flex items-center justify-between transition-all"
    >
      {/* Left section: Sidebar toggle & Logo & Brand & Mode Selector */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <XYBotLogo size={32} isPremium={isPremium} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                XYBOT <span className="neon-text">AI</span>
              </span>
            </div>
            <span className="text-[9px] text-white/40 font-mono tracking-wider uppercase -mt-0.5 hidden sm:inline">
              Neural Matrix
            </span>
          </div>
        </div>

        {/* Integrated XY Mode Selector Dropdown */}
        <div className="ml-1 sm:ml-2">
          <ModeSelector variant="header" />
        </div>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Quick action: Export to PDF */}
        {currentChat && currentChat.messages.length > 0 && (
          <button
            onClick={handleExportPdf}
            title="Export conversation to PDF"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all hidden sm:flex items-center justify-center"
          >
            <FileDown className="w-4 h-4" />
          </button>
        )}

        {/* Quick action: Share */}
        {currentChat && currentChat.messages.length > 0 && (
          <button
            onClick={handleShareChat}
            title="Copy and Share Conversation"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all hidden sm:flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => setShortcutsOpen(true)}
          title="Keyboard Shortcuts (?)"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all hidden md:flex items-center justify-center"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* New Chat Button */}
        <button
          onClick={() => createNewChat()}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs sm:text-sm font-semibold text-white transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#00f2ff]" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Premium Upgrade Button */}
        <button
          onClick={openPremiumModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 ${
            isPremium
              ? 'badge-gold hover:brightness-110'
              : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black hover:brightness-105'
          }`}
        >
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">{isPremium ? 'VIP Active' : 'Upgrade'}</span>
        </button>

        {/* Profile Switcher & Persona Manager */}
        <ProfileSwitcher variant="header" onOpenProfileModal={() => setActiveView('profile')} />
      </div>
    </header>
  );
};

