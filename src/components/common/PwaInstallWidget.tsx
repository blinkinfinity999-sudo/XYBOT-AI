import React, { useState, useEffect } from 'react';
import { Download, X, Laptop, Smartphone, Info, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../../lib/soundEffects';

export const PwaInstallWidget: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone (PWA installed) mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Capture the PWA install prompt
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show a subtle notification of app availability after 4 seconds
      setTimeout(() => {
        setShowNotification(true);
      }, 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);

    // Track when the app is installed successfully
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      setDeferredPrompt(null);
      setIsStandalone(true);
      setShowPopup(false);
      setShowNotification(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleWidgetClick = () => {
    sounds.playClick();
    setShowPopup(true);
    setShowNotification(false);
  };

  const handleInstallClick = async () => {
    sounds.playClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
    }
  };

  // If already installed, don't show any widget or button
  if (isStandalone) return null;

  return (
    <>
      {/* Floating Trigger Widget at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
        
        {/* Animated mini-notification bubble */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-400/30 p-3 rounded-2xl shadow-xl max-w-xs text-xs text-white flex items-start gap-2.5 pointer-events-auto cursor-pointer"
              onClick={handleWidgetClick}
            >
              <div className="p-1 rounded-lg bg-cyan-400/20 text-cyan-300 mt-0.5">
                <Download className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <span className="font-bold block text-cyan-200">XYBOT Native App Ready</span>
                <span className="text-[10px] text-slate-300 block mt-0.5">Install on your device for high-performance offline access.</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotification(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small floating action button */}
        <button
          onClick={handleWidgetClick}
          className="pointer-events-auto p-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/35 border border-white/10 transition-all hover:scale-105 active:scale-95 group relative flex items-center justify-center"
          title="Install App"
        >
          <Download className="w-5 h-5 group-hover:animate-bounce" />
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-[#0e0e14] border border-white/10 text-[10px] font-bold tracking-wide uppercase text-cyan-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Download App
          </span>
        </button>
      </div>

      {/* Modern Dialog Modal Overlay */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0e0e14] border border-cyan-500/20 rounded-3xl p-6 shadow-2xl relative space-y-5"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowPopup(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {/* Title Header */}
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
                  <Download className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-wide">Download XYBOT AI</h3>
                <p className="text-xs text-slate-400">
                  Synthesize a standalone progressive web app onto your desktop or mobile.
                </p>
              </div>

              {/* Install Action or Guidance Grid */}
              <div className="space-y-4 pt-1.5">
                {deferredPrompt ? (
                  /* Chrome/Edge Direct Trigger */
                  <div className="space-y-3">
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-105 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Download className="w-4 h-4 fill-current" />
                      <span>Install Instant App</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-500 leading-relaxed">
                      Chrome, Edge, or Brave will launch a native prompt window to complete download.
                    </p>
                  </div>
                ) : (
                  /* Universal Platform Manual Guidance */
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>iOS Safari Setup (iPhone / iPad)</span>
                      </div>
                      <ol className="space-y-2 text-xs text-slate-300">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[10px] text-cyan-300 flex-shrink-0 mt-0.5">1</span>
                          <span>Tap the <span className="text-white font-bold inline-flex items-center gap-0.5"><Share className="w-3.5 h-3.5 text-cyan-400" /> Share</span> action button in your browser drawer.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[10px] text-cyan-300 flex-shrink-0 mt-0.5">2</span>
                          <span>Scroll down and select <span className="text-white font-bold inline-flex items-center gap-0.5"><PlusSquare className="w-3.5 h-3.5 text-cyan-400" /> Add to Home Screen</span>.</span>
                        </li>
                      </ol>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 text-[10px] font-extrabold text-purple-400 uppercase tracking-widest">
                        <Laptop className="w-3.5 h-3.5" />
                        <span>Chrome / Edge Desktop Setup</span>
                      </div>
                      <ol className="space-y-2 text-xs text-slate-300">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[10px] text-purple-300 flex-shrink-0 mt-0.5">1</span>
                          <span>Click the <span className="text-white font-bold">Install Monitor</span> icon (resembling a monitor with downward arrow) located on the far right of the web URL address bar.</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* Benefits Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/20 to-purple-950/20 border border-cyan-500/10 flex items-start gap-2.5 text-[11px] text-slate-400 leading-normal">
                  <Info className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Offline Ready & High Performance:</strong>
                    Installed app launches in its own frameless window, optimizes caching speeds, and operates smoothly offline.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
