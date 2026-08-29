import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { XYBotLogo } from './XYBotLogo';
import { XY_MODES } from '../../constants/modes';
import { 
  Plus, 
  MessageSquare, 
  Image as ImageIcon, 
  Eye, 
  Mic, 
  Wrench, 
  Settings, 
  Crown, 
  HelpCircle, 
  Info, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  Sparkles,
  Zap,
  Check,
  AlertTriangle,
  Layers,
  PanelLeftClose,
  ChevronRight,
  Shield,
  Download,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileSwitcher } from '../profile/ProfileSwitcher';
import { ActiveView } from '../../types';

interface Props {
  onOpenHelp: () => void;
  onOpenAbout: () => void;
}

export const Sidebar: React.FC<Props> = ({ onOpenHelp, onOpenAbout }) => {
  const { 
    isSidebarOpen, 
    setSidebarOpen, 
    activeView, 
    setActiveView, 
    chats, 
    activeChatId, 
    selectChat, 
    createNewChat, 
    deleteChat, 
    deleteAllChats, 
    renameChat, 
    togglePinChat, 
    openPremiumModal, 
    user,
    remainingImageGenerations
  } = useApp();

  const [searchHistory, setSearchHistory] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isPremium = user.plan !== 'free';

  // PWA Install Prompt States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showInstallSuccess, setShowInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Detect if running as standalone/installed app
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
        || (navigator as any).standalone 
        || document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      setDeferredPrompt(null);
      setIsStandalone(true);
      setShowInstallSuccess(true);
      setTimeout(() => setShowInstallSuccess(false), 5000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Install choice outcome: ${outcome}`);
      setDeferredPrompt(null);
    }
  };

  // Close features dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFeaturesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const featureItems: { 
    id: ActiveView; 
    label: string; 
    icon: React.FC<any>; 
    badge?: string; 
    description: string;
    color: string;
    onClick?: () => void;
  }[] = [
    { 
      id: 'chat', 
      label: 'AI Chat', 
      icon: MessageSquare, 
      description: 'Conversational reasoning & code',
      color: 'text-cyan-400' 
    },
    { 
      id: 'image-gen', 
      label: 'Image Generator', 
      icon: ImageIcon, 
      badge: 'AI Art', 
      description: 'Fast generative art studio',
      color: 'text-purple-400' 
    },
    { 
      id: 'vision', 
      label: 'AI Vision & OCR', 
      icon: Eye, 
      description: 'Multimodal scanner & analyzer',
      color: 'text-emerald-400' 
    },
    { 
      id: 'voice-chat', 
      label: 'Voice Chat', 
      icon: Mic, 
      badge: 'Live', 
      description: 'Real-time neural audio conversation',
      color: 'text-rose-400' 
    },
    { 
      id: 'ai-tools', 
      label: 'AI Suite Tools', 
      icon: Wrench, 
      description: 'Writing, summaries, code & math',
      color: 'text-amber-400' 
    },
    { 
      id: 'settings', 
      label: 'Settings & Security', 
      icon: Settings, 
      description: 'Preferences, 4-digit PIN, themes',
      color: 'text-slate-300' 
    },
    { 
      id: 'premium', 
      label: 'Premium VIP Hub', 
      icon: Crown, 
      badge: isPremium ? 'Active' : 'Upgrade', 
      description: 'Quotas, VIP models & plan manager',
      color: 'text-amber-300',
      onClick: () => openPremiumModal()
    },
    { 
      id: 'help', 
      label: 'Help & Guide', 
      icon: HelpCircle, 
      description: 'Tips, shortcuts & documentation',
      color: 'text-sky-400',
      onClick: () => onOpenHelp()
    },
    { 
      id: 'about', 
      label: 'About XYBOT AI', 
      icon: Info, 
      description: 'System specifications & architecture',
      color: 'text-indigo-400',
      onClick: () => onOpenAbout()
    },
  ];

  const currentFeature = featureItems.find((f) => f.id === activeView) || featureItems[0];
  const CurrentFeatureIcon = currentFeature.icon;

  const handleSelectFeature = (item: typeof featureItems[0]) => {
    if (item.onClick) {
      item.onClick();
    } else {
      setActiveView(item.id);
    }
    setIsFeaturesDropdownOpen(false);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.FormEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameChat(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const filteredChats = chats.filter((c) => 
    c.title.toLowerCase().includes(searchHistory.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchHistory.toLowerCase()))
  );

  const pinnedChats = filteredChats.filter((c) => c.isPinned);
  const recentChats = filteredChats.filter((c) => !c.isPinned);

  return (
    <>
      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Drawer Container */}
      <aside
        id="app_sidebar_panel"
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 sm:w-80 bg-[#0d0d0d] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header of Sidebar with Logo and COLLAPSE SIDEBAR BUTTON */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div
            onClick={() => {
              setActiveView('home');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="p-1 rounded-xl neon-border flex items-center justify-center">
              <XYBotLogo size={28} isPremium={isPremium} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-white tracking-wider">
                XYBOT <span className="neon-text">AI</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono">Neural Interface</span>
            </div>
          </div>

          {/* Dedicated Sidebar Collapse Button */}
          <button
            id="sidebar_collapse_button"
            onClick={() => setSidebarOpen(false)}
            title="Collapse Sidebar"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-semibold"
          >
            <PanelLeftClose className="w-4 h-4 text-[#00f2ff]" />
            <span className="hidden sm:inline text-[11px]">Collapse</span>
          </button>
        </div>

        {/* Action: New Chat Button & FEATURES DROPDOWN HUB */}
        <div className="p-3 space-y-2 border-b border-white/5 bg-[#0a0a0f]">
          {/* + New Chat */}
          <button
            id="new_chat_button"
            onClick={() => {
              createNewChat();
              setActiveView('chat');
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#00f2ff]/20 to-[#7000ff]/20 hover:from-[#00f2ff]/30 hover:to-[#7000ff]/30 border border-[#00f2ff]/40 text-white text-xs font-bold tracking-wide flex items-center justify-between shadow-[0_0_15px_rgba(0,242,255,0.1)] active:scale-98 transition-all group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#00f2ff]/20 flex items-center justify-center text-[#00f2ff] group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span>New Conversation</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-[#00f2ff] opacity-80" />
          </button>

          {/* AI FEATURES & TOOLS DROPDOWN BUTTON */}
          <div ref={dropdownRef} className="relative">
            <button
              id="ai_features_dropdown_button"
              onClick={() => setIsFeaturesDropdownOpen(!isFeaturesDropdownOpen)}
              className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                isFeaturesDropdownOpen
                  ? 'bg-white/10 border-[#00f2ff] text-white shadow-[0_0_15px_rgba(0,242,255,0.15)]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/90'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <CurrentFeatureIcon className={`w-3.5 h-3.5 ${currentFeature.color}`} />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-[11px] font-bold text-white truncate flex items-center gap-1.5">
                    {currentFeature.label}
                    {currentFeature.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#00f2ff]/20 text-[#00f2ff] font-semibold">
                        {currentFeature.badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] text-white/40 font-mono">Open Features Hub</span>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-white/50 transition-transform duration-200 ${
                  isFeaturesDropdownOpen ? 'rotate-180 text-[#00f2ff]' : ''
                }`}
              />
            </button>

            {/* Expansible Features Dropdown Menu */}
            <AnimatePresence>
              {isFeaturesDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-2xl bg-[#0e0e14] border border-white/15 shadow-2xl z-50 backdrop-blur-2xl max-h-[380px] overflow-y-auto space-y-1"
                >
                  <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider font-bold">
                    <span>XYBOT Capabilities</span>
                    <Layers className="w-3 h-3 text-[#00f2ff]" />
                  </div>

                  {featureItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeView === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectFeature(item)}
                        className={`w-full p-2 rounded-xl text-left flex items-start gap-2.5 transition-all border ${
                          isSelected
                            ? 'bg-[#00f2ff]/10 border-[#00f2ff]/40 text-white'
                            : 'border-transparent hover:bg-white/5 text-white/70 hover:text-white'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
                          <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              {item.label}
                              {item.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/70 font-semibold">
                                  {item.badge}
                                </span>
                              )}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#00f2ff]" />}
                          </div>
                          <p className="text-[10px] text-white/50 truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MAIN BODY: PURE CHAT HISTORY / MEMORY */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-3 pt-3">
          {/* History Header & Search */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
              <MessageSquare className="w-3.5 h-3.5 text-[#00f2ff]" />
              <span>Chat History</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/60 font-mono">
                {chats.length}
              </span>
            </div>

            {chats.length > 0 && (
              <button
                onClick={() => setShowDeleteAllModal(true)}
                className="text-[10px] text-white/40 hover:text-rose-400 transition-colors font-medium flex items-center gap-1"
                title="Clear all chat history"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Search History input */}
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              placeholder="Search chat history..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#00f2ff] text-xs text-white placeholder-white/30 outline-none transition-all"
            />
          </div>

          {/* Scrollable Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Pinned Section */}
            {pinnedChats.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 px-1 flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Pinned Chats
                </span>
                {pinnedChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    isEditing={editingChatId === chat.id}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      selectChat(chat.id);
                      setActiveView('chat');
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      togglePinChat(chat.id);
                    }}
                    onStartRename={(e) => handleStartRename(chat.id, chat.title, e)}
                    onSaveRename={(e) => handleSaveRename(chat.id, e)}
                    onDelete={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Recent Section */}
            {recentChats.length > 0 && (
              <div className="space-y-1">
                {pinnedChats.length > 0 && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30 px-1 block pt-1">
                    Recent Conversations
                  </span>
                )}
                {recentChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    isEditing={editingChatId === chat.id}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      selectChat(chat.id);
                      setActiveView('chat');
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      togglePinChat(chat.id);
                    }}
                    onStartRename={(e) => handleStartRename(chat.id, chat.title, e)}
                    onSaveRename={(e) => handleSaveRename(chat.id, e)}
                    onDelete={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Empty History State */}
            {filteredChats.length === 0 && (
              <div className="text-center py-10 px-2 flex flex-col items-center justify-center text-white/40">
                <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-[#00f2ff]" />
                <p className="text-xs font-medium">
                  {searchHistory ? 'No matching conversations' : 'No chat history yet'}
                </p>
                <p className="text-[10px] text-white/30 mt-1 max-w-[180px]">
                  {searchHistory ? 'Try a different keyword search' : 'Start a new conversation to begin generating intelligence.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sidebar: Quota, Help, About, VIP banner */}
        <div className="p-3 border-t border-white/5 bg-[#0d0d0d] space-y-2">
          {/* Pro / Free Plan quota status badge */}
          <div
            onClick={openPremiumModal}
            className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all flex flex-col gap-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isPremium ? 'VIP Active' : 'Upgrade to Pro'}
                </span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isPremium ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/10 text-slate-300'}`}>
                {isPremium ? 'VIP' : 'FREE'}
              </span>
            </div>

            <p className="text-[11px] text-white/60">
              {isPremium ? 'Unlimited image synthesis and reasoning.' : `${remainingImageGenerations} image generations remaining.`}
            </p>

            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff]"
                style={{
                  width: isPremium || typeof remainingImageGenerations !== 'number'
                    ? '100%'
                    : `${Math.max(15, (remainingImageGenerations / 4) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* PWA Download / Install App widget */}
          {!isStandalone && (
            <div className="mx-3 my-1 p-3 rounded-2xl bg-gradient-to-br from-cyan-950/20 to-blue-950/20 border border-cyan-500/15 shadow-md flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-white block">Download XYbot AI</span>
                  <span className="text-[9px] text-slate-400 block leading-normal mt-0.5">
                    Install for offline access, desktop dock, and custom speeds.
                  </span>
                </div>
              </div>

              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 font-bold text-[10px] tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install Web App</span>
                </button>
              ) : (
                <div className="space-y-1 border-t border-white/5 pt-1.5">
                  <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest block">How to setup:</span>
                  <p className="text-[9px] text-slate-400 flex items-start gap-1 leading-normal">
                    <span className="w-1 h-1 rounded-full bg-cyan-400/60 mt-1 flex-shrink-0" />
                    <span><strong>Chrome/Edge:</strong> Click install icon in URL bar</span>
                  </p>
                  <p className="text-[9px] text-slate-400 flex items-start gap-1 leading-normal">
                    <span className="w-1 h-1 rounded-full bg-cyan-400/60 mt-1 flex-shrink-0" />
                    <span><strong>Safari (iOS):</strong> Share &rarr; Add to Home Screen</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {showInstallSuccess && (
            <div className="mx-3 my-1 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium text-center animate-pulse">
              XYbot AI successfully installed!
            </div>
          )}

          {/* User Identity / Multi-Profile Switcher */}
          <div className="pt-1">
            <ProfileSwitcher
              variant="sidebar"
              onOpenProfileModal={() => {
                setActiveView('profile');
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
            />
          </div>

          {/* Help & About Footer buttons */}
          <div className="flex items-center justify-between text-xs text-white/40 pt-1 px-1">
            <button
              onClick={() => {
                onOpenHelp();
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help Guide</span>
            </button>
            <button
              onClick={() => {
                onOpenAbout();
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About Core</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Delete All Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl text-center"
            >
              <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3 animate-pulse" />
              <h3 className="text-lg font-bold text-white mb-1">Delete All History?</h3>
              <p className="text-xs text-slate-400 mb-6">
                This will permanently erase all saved chat transcripts and cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    deleteAllChats();
                    setShowDeleteAllModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteAllModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

interface ChatItemProps {
  chat: any;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (t: string) => void;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: (e: React.FormEvent | React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  onSelect,
  onTogglePin,
  onStartRename,
  onSaveRename,
  onDelete,
}) => {
  const chatMode = chat.mode ? XY_MODES[chat.mode] : null;

  return (
    <div
      onClick={onSelect}
      className={`group relative p-2.5 rounded-2xl flex items-center justify-between cursor-pointer text-xs transition-all ${
        isActive
          ? 'bg-cyan-950/50 border border-cyan-500/40 text-white font-medium shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
        
        {isEditing ? (
          <form onSubmit={onSaveRename} className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-2 py-0.5 rounded bg-slate-950 border border-cyan-400 text-white text-xs outline-none"
            />
            <button
              type="submit"
              className="p-1 text-emerald-400 hover:text-emerald-300"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="truncate flex-1">{chat.title}</span>
            {chatMode && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold flex-shrink-0 ${chatMode.bgGlow} ${chatMode.color}`}>
                {chatMode.badge}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions (Pin, Rename, Delete) */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onTogglePin}
            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
              chat.isPinned ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'
            }`}
            title={chat.isPinned ? 'Unpin chat' : 'Pin chat'}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={onStartRename}
            className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors"
            title="Rename"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
            title="Delete conversation"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
