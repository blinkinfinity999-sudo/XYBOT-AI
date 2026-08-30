import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { HomeView } from './components/home/HomeView';
import { ChatArea } from './components/chat/ChatArea';
import { ImageGenView } from './components/image-gen/ImageGenView';
import { VisionView } from './components/vision/VisionView';
import { VoiceChatModal } from './components/voice/VoiceChatModal';
import { AIToolsView } from './components/tools/AIToolsView';
import { ProfileModal } from './components/profile/ProfileModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { PremiumModal } from './components/premium/PremiumModal';
import { AuthModal } from './components/auth/AuthModal';
import { PasscodeModal } from './components/common/PasscodeModal';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { HelpAboutModal } from './components/common/HelpAboutModal';
import { ToastContainer } from './components/common/ToastContainer';
import { NetworkBanner } from './components/common/NetworkBanner';
import { PwaInstallWidget } from './components/common/PwaInstallWidget';

const MainLayout: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    settings, 
    isLocked, 
    setIsLocked, 
    user,
    isLoggedIn,
    isSidebarOpen
  } = useApp();

  const [helpAboutType, setHelpAboutType] = useState<'help' | 'about' | null>(null);

  // If user is not logged in, show Auth Gate
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-100 flex items-center justify-center p-4">
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  // If app is locked with passcode, show Passcode Gate
  if (settings.passcodeEnabled && isLocked) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-100 flex items-center justify-center p-4">
        <PasscodeModal />
        <ToastContainer />
      </div>
    );
  }

  // Theme styling based on settings
  const themeClass = settings.themeMode === 'light'
    ? 'theme-light bg-slate-900 text-slate-100'
    : settings.themeMode === 'oled'
    ? 'theme-oled bg-black text-white'
    : 'theme-dark bg-[#050505] text-slate-100';

  // Wallpaper backgrounds
  const getWallpaperBackground = () => {
    switch (settings.wallpaper) {
      case 'cyber-grid':
        return 'bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px]';
      case 'deep-nebula':
        return 'bg-gradient-to-br from-indigo-950/20 via-[#050505] to-purple-950/20';
      case 'obsidian-hex':
        return 'bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] [background-size:32px_32px]';
      case 'minimal-aurora':
        return 'bg-gradient-to-b from-[#0a0a0a] via-[#050505] to-[#000000]';
      default:
        return 'bg-[#050505]';
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans selection:bg-[#00f2ff] selection:text-black ${themeClass} ${getWallpaperBackground()} transition-colors duration-300 relative overflow-hidden`}>
      {/* Network Offline Banner */}
      <NetworkBanner />

      {/* Main Top Header */}
      <Header />

      {/* App Shell Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar
          onOpenHelp={() => setHelpAboutType('help')}
          onOpenAbout={() => setHelpAboutType('about')}
        />

        {/* Dynamic View Center Area */}
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:pl-72 sm:md:pl-80' : 'md:pl-0'} h-[calc(100vh-4rem)] overflow-hidden`}>
          {activeView === 'home' && <HomeView />}
          {activeView === 'chat' && <ChatArea />}
          {activeView === 'image-gen' && <ImageGenView />}
          {activeView === 'vision' && <VisionView />}
          {activeView === 'voice-chat' && <VoiceChatModal />}
          {activeView === 'ai-tools' && <AIToolsView />}
        </main>
      </div>

      {/* Modals & Popups */}
      {activeView === 'profile' && <ProfileModal onClose={() => setActiveView('chat')} />}
      {activeView === 'settings' && <SettingsModal onClose={() => setActiveView('chat')} />}
      <PremiumModal />
      <ShortcutsModal />
      {helpAboutType && (
        <HelpAboutModal
          type={helpAboutType}
          onClose={() => setHelpAboutType(null)}
        />
      )}
      <ToastContainer />
      <PwaInstallWidget />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
