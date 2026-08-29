import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Palette, 
  Globe, 
  Bell, 
  Volume2, 
  Shield, 
  Trash2, 
  RefreshCcw, 
  X, 
  Lock, 
  Check, 
  Smartphone,
  Eye,
  Sliders
} from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeAccent, ThemeMode } from '../../types';

interface Props {
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ onClose }) => {
  const { settings, updateSettings, clearCache, deleteAccount, showToast } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  const languages = [
    { code: 'English', label: 'English (US)' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
    { code: 'Spanish', label: 'Español (Spanish)' },
    { code: 'French', label: 'Français (French)' },
    { code: 'German', label: 'Deutsch (German)' },
    { code: 'Japanese', label: '日本語 (Japanese)' },
    { code: 'Chinese', label: '中文 (Chinese)' },
    { code: 'Arabic', label: 'العربية (Arabic)' },
    { code: 'Portuguese', label: 'Português (Portuguese)' },
  ];

  const accents: { id: ThemeAccent; label: string; color: string }[] = [
    { id: 'cyan', label: 'Neon Cyan', color: '#06b6d4' },
    { id: 'purple', label: 'Cosmic Violet', color: '#a855f7' },
    { id: 'emerald', label: 'Cyber Matrix', color: '#10b981' },
    { id: 'rose', label: 'Rose Nebula', color: '#f43f5e' },
    { id: 'amber', label: 'Solar Gold', color: '#f59e0b' },
  ];

  const wallpapers = [
    { id: 'cyber-grid', label: 'Cyber Grid' },
    { id: 'deep-nebula', label: 'Deep Nebula' },
    { id: 'obsidian-hex', label: 'Obsidian Hex' },
    { id: 'minimal-aurora', label: 'Minimal Aurora' },
  ];

  const handleSavePin = () => {
    if (pinInput.length !== 4) {
      showToast({ type: 'error', title: 'Invalid PIN', message: 'Passcode must be 4 digits.' });
      return;
    }
    updateSettings({ passcodeEnabled: true, passcodeHash: pinInput });
    setIsSettingPin(false);
    setPinInput('');
    showToast({ type: 'success', title: 'Passcode Activated', message: 'App lock security is now enabled.' });
  };

  const handleRemovePin = () => {
    updateSettings({ passcodeEnabled: false, passcodeHash: '' });
    showToast({ type: 'info', title: 'Passcode Removed', message: 'App lock disabled.' });
  };

  const handleDeleteAccountConfirmation = () => {
    if (window.confirm("Are you sure you want to delete your account? This will erase all chats, profile data, and image caches, returning you to the login screen.")) {
      deleteAccount();
      onClose();
    }
  };

  return (
    <div
      id="settings_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#00f2ff]">
            <Settings className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white tracking-wide">System Matrix Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mt-5 text-sm text-slate-300">
          {/* 1. Theme Mode */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-[#00f2ff]" /> Interface Theme
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'dark' as ThemeMode, label: 'Futuristic Dark', icon: Moon },
                { id: 'oled' as ThemeMode, label: 'Obsidian OLED', icon: Monitor },
                { id: 'light' as ThemeMode, label: 'Cyber Light', icon: Sun },
              ].map((mode) => {
                const Icon = mode.icon;
                const active = settings.themeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => updateSettings({ themeMode: mode.id })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      active
                        ? 'bg-white/10 border-[#00f2ff] text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#00f2ff]' : 'text-white/40'}`} />
                    <span className="text-xs font-semibold">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Theme Accent Color */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-400" /> Neon Accent Pulse
            </label>
            <div className="flex flex-wrap gap-2.5">
              {accents.map((acc) => {
                const active = settings.themeAccent === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => updateSettings({ themeAccent: acc.id })}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      active
                        ? 'bg-white/10 border-[#00f2ff] text-white shadow-md'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
                    <span>{acc.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#00f2ff] ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Wallpaper selection */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" /> Chat Canvas Wallpaper
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {wallpapers.map((wp) => {
                const active = settings.wallpaper === wp.id;
                return (
                  <button
                    key={wp.id}
                    onClick={() => updateSettings({ wallpaper: wp.id })}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      active
                        ? 'bg-white/10 border-[#00f2ff] text-[#00f2ff] font-bold'
                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {wp.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Language Selector */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#00f2ff]" /> Neural Language Core
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-sm text-white focus:border-[#00f2ff] outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#0d0d0d] text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Toggles (Notifications, Audio, Haptics, Memory) */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between p-3 rounded-2xl glass border border-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#00f2ff]" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Toast Notifications</h4>
                  <p className="text-[11px] text-white/40">Show floating alerts and status updates</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#00f2ff] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl glass border border-white/10">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Futuristic UI Audio</h4>
                  <p className="text-[11px] text-white/40">Synthesizer clicks, chimes, and responses</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffectsEnabled}
                onChange={(e) => updateSettings({ soundEffectsEnabled: e.target.checked })}
                className="w-4 h-4 accent-purple-400 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl glass border border-white/10">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Haptic Pulse Feedback</h4>
                  <p className="text-[11px] text-white/40">Vibration response on mobile & touch</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.hapticFeedbackEnabled}
                onChange={(e) => updateSettings({ hapticFeedbackEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl glass border border-white/10">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Conversation Memory Context</h4>
                  <p className="text-[11px] text-white/40">Retain chat history context in ongoing sessions</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.conversationMemory}
                onChange={(e) => updateSettings({ conversationMemory: e.target.checked })}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* 6. Security Passcode Setup */}
          <div className="p-4 rounded-2xl glass border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00f2ff]" />
                <h4 className="text-xs font-semibold text-white">App Passcode Lock</h4>
              </div>
              {settings.passcodeEnabled ? (
                <button
                  onClick={handleRemovePin}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Disable PIN
                </button>
              ) : (
                <button
                  onClick={() => setIsSettingPin(!isSettingPin)}
                  className="text-xs text-[#00f2ff] hover:text-cyan-300 font-semibold"
                >
                  {isSettingPin ? 'Cancel' : 'Setup 4-digit PIN'}
                </button>
              )}
            </div>

            {isSettingPin && (
              <div className="flex gap-2 mt-3">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4 digits"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#050505] border border-white/20 text-sm text-white focus:border-[#00f2ff] outline-none text-center tracking-widest"
                />
                <button
                  onClick={handleSavePin}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#7000ff] text-white text-xs font-bold transition-all"
                >
                  Lock App
                </button>
              </div>
            )}
          </div>

          {/* 7. Clear Cache & Delete Account Actions */}
          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={clearCache}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-[#00f2ff]" />
              <span>Clear Offline Cache</span>
            </button>

            <button
              onClick={handleDeleteAccountConfirmation}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Account & Reset</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold tracking-wide transition-all"
        >
          Save & Exit
        </button>
      </motion.div>
    </div>
  );
};
