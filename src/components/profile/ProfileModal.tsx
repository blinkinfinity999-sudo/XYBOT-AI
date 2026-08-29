import React, { useState, useRef } from 'react';
import { useApp, PLANS } from '../../context/AppContext';
import { UserProfile, PlanType } from '../../types';
import { PRESET_AVATARS, PROFILE_COLOR_PRESETS } from '../../constants/avatars';
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Upload, 
  Calendar, 
  MessageSquare, 
  Image as ImageIcon, 
  Cpu, 
  Check, 
  X, 
  Sparkles, 
  Crown, 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  UserCheck, 
  Sliders, 
  Bot, 
  Palette,
  ExternalLink,
  ChevronRight,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SelfieCameraModal } from './SelfieCameraModal';

interface Props {
  onClose: () => void;
}

export const ProfileModal: React.FC<Props> = ({ onClose }) => {
  const { 
    user, 
    setUser, 
    profiles, 
    activeProfileId, 
    switchProfile, 
    createProfile, 
    updateProfile, 
    deleteProfile, 
    duplicateProfile, 
    openPremiumModal, 
    showToast 
  } = useApp();

  // Tab mode: 'overview' | 'manage_ids' | 'create_id' | 'edit_active'
  const [activeTab, setActiveTab] = useState<'overview' | 'manage_ids' | 'create_id' | 'edit_active'>('overview');
  
  // Selfie Camera Modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'edit' | 'new'>('edit');

  // Active Profile Editing state
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editTagline, setEditTagline] = useState(user.tagline || '');
  const [editColor, setEditColor] = useState(user.color || 'cyan');
  const [editInstruction, setEditInstruction] = useState(user.customInstruction || '');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(user.avatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // New Profile Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newColor, setNewColor] = useState('cyan');
  const [newInstruction, setNewInstruction] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState(PRESET_AVATARS[0].url);

  // Custom Avatar Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Reset edit form when user changes
  React.useEffect(() => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditTagline(user.tagline || '');
    setEditColor(user.color || 'cyan');
    setEditInstruction(user.customInstruction || '');
    setSelectedAvatarUrl(user.avatar);
  }, [user]);

  const planInfo = PLANS[user.plan];
  const isPremium = user.plan !== 'free';

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast({ type: 'error', title: 'File Too Large', message: 'Please choose an image under 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          if (isNew) {
            setNewAvatarUrl(result);
          } else {
            setSelectedAvatarUrl(result);
            setUser((prev) => ({ ...prev, avatar: result }));
          }
          showToast({ type: 'success', title: 'Avatar Image Loaded' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveActiveProfile = () => {
    if (!editName.trim()) {
      showToast({ type: 'warning', title: 'Name Required', message: 'Please enter a valid display name.' });
      return;
    }

    updateProfile(user.id, {
      name: editName.trim(),
      email: editEmail.trim() || user.email,
      tagline: editTagline.trim(),
      color: editColor,
      customInstruction: editInstruction.trim() || undefined,
      avatar: selectedAvatarUrl,
    });

    setActiveTab('overview');
  };

  const handleCreateNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast({ type: 'warning', title: 'Name Required', message: 'Please enter a name for the new profile ID.' });
      return;
    }

    createProfile({
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@xybot.ai`,
      tagline: newTagline.trim() || 'Custom Persona',
      color: newColor,
      customInstruction: newInstruction.trim() || undefined,
      avatar: newAvatarUrl,
    });

    // Reset create form
    setNewName('');
    setNewEmail('');
    setNewTagline('');
    setNewInstruction('');
    setActiveTab('overview');
  };

  const memberSinceStr = new Date(user.joinedDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      id="profile_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-2xl bg-[#0d0d0d] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Neural Identity & Profiles
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-normal">
                  {profiles.length} {profiles.length === 1 ? 'Profile' : 'Profiles'}
                </span>
              </h3>
              <p className="text-xs text-white/50">Manage your active identity personas and system instructions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl my-4 border border-white/10 flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border border-cyan-500/50 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Active ID</span>
          </button>

          <button
            onClick={() => setActiveTab('manage_ids')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'manage_ids'
                ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-white border border-purple-500/50 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>All Profiles ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create_id')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create_id'
                ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-white border border-emerald-500/50 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New ID</span>
          </button>
        </div>

        {/* Scrollable Main Body Content */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Active Profile Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Avatar with preset indicator */}
                  <div className="relative group flex-shrink-0">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 shadow-xl p-1 bg-black ${
                      isPremium ? 'border-amber-400' : 'border-cyan-400'
                    }`}>
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('edit_active');
                        setShowAvatarPicker(true);
                      }}
                      className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity cursor-pointer m-1"
                    >
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>Change</span>
                    </button>
                  </div>

                  {/* Profile info & Persona details */}
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                      <h4 className="text-xl font-extrabold text-white tracking-tight">{user.name}</h4>
                      {isPremium && <Crown className="w-4 h-4 text-amber-400 fill-current" />}
                      {user.tagline && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          {user.tagline}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 font-mono mb-3">{user.email}</p>

                    {/* Custom Persona Instruction Summary if set */}
                    {user.customInstruction ? (
                      <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 mb-3 flex items-start gap-2">
                        <Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-purple-300 block">Custom Persona Instructions</span>
                          <p className="line-clamp-2 text-white/80">{user.customInstruction}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-white/40 italic mb-3">
                        No custom persona instructions set. Standard XYBOT AI core behaviors active.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        onClick={() => setActiveTab('edit_active')}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Edit ID Details</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('manage_ids')}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5 text-purple-400" />
                        <span>Switch ID ({profiles.length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Neural Matrix Statistics Bento */}
              <div>
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2.5">
                  Identity Neural Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                    <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium text-white/40">Prompts</span>
                    </div>
                    <span className="text-xl font-bold text-white">{user.totalPromptsCount}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                    <div className="flex items-center gap-1.5 text-purple-400 mb-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium text-white/40">AI Images</span>
                    </div>
                    <span className="text-xl font-bold text-white">{user.imagesGeneratedCount}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                    <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                      <Cpu className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium text-white/40">Words Synthesized</span>
                    </div>
                    <span className="text-xl font-bold text-white">{user.totalWordsGenerated}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col col-span-2 sm:col-span-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Member Since
                      </span>
                      <span className="font-semibold text-white">{memberSinceStr}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE & SWITCH ALL IDS */}
          {activeTab === 'manage_ids' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                  Available Identity Personas ({profiles.length})
                </span>
                <button
                  onClick={() => setActiveTab('create_id')}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add ID</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {profiles.map((prof) => {
                  const isActive = prof.id === activeProfileId;
                  return (
                    <div
                      key={prof.id}
                      onClick={() => switchProfile(prof.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(0,242,255,0.15)] ring-1 ring-cyan-400/50'
                          : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                      }`}
                    >
                      {/* Avatar & Persona info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <img
                            src={prof.avatar}
                            alt={prof.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-md"
                          />
                          {isActive && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white truncate">{prof.name}</span>
                            {prof.tagline && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 flex-shrink-0">
                                {prof.tagline}
                              </span>
                            )}
                            {prof.isDefault && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 truncate">{prof.email}</p>
                          {prof.customInstruction && (
                            <p className="text-[10px] text-purple-300/80 truncate mt-0.5">
                              Prompt: {prof.customInstruction}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isActive ? (
                          <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => switchProfile(prof.id)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                          >
                            Switch
                          </button>
                        )}

                        <button
                          onClick={() => duplicateProfile(prof.id)}
                          title="Clone / Duplicate Profile"
                          className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {profiles.length > 1 && (
                          <button
                            onClick={() => deleteProfile(prof.id)}
                            title="Delete Profile ID"
                            className="p-2 rounded-xl text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CREATE NEW PROFILE ID */}
          {activeTab === 'create_id' && (
            <form onSubmit={handleCreateNewProfile} className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Create New Identity / Persona ID
                </h4>

                <div>
                  <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                    Profile / Identity Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dev Architect, Scholar, Creative Muse, Work ID..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/15 text-sm text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Role / Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Coding & Architecture, Research..."
                      value={newTagline}
                      onChange={(e) => setNewTagline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/15 text-sm text-white focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="persona@xybot.ai"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/15 text-sm text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                {/* Custom System Instruction for Persona */}
                <div>
                  <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1 flex items-center justify-between">
                    <span>Persona Behavior & System Prompt (Optional)</span>
                    <span className="text-[10px] text-purple-400">Customizes AI tone & memory</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Always respond with concise code solutions, typescript examples, and direct explanations."
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/15 text-xs text-white focus:border-cyan-400 outline-none resize-none"
                  />
                </div>

                {/* Choose Avatar Preset */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                      Select Persona Avatar
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCameraTarget('new');
                          setIsCameraOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Take Selfie</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => newFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={newFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarUpload(e, true)}
                    />
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => setNewAvatarUrl(av.url)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                          newAvatarUrl === av.url ? 'border-cyan-400 scale-105 shadow-md' : 'border-white/10 opacity-70 hover:opacity-100'
                        }`}
                        title={av.name}
                      >
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-lg" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-md"
                >
                  Create & Activate Identity
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: EDIT ACTIVE PROFILE */}
          {activeTab === 'edit_active' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Edit Current Profile ID ({user.name})
                </h4>

                <div>
                  <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/15 text-sm text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Persona Role / Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Engineer, Creative..."
                      value={editTagline}
                      onChange={(e) => setEditTagline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/15 text-sm text-white focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/15 text-sm text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                    Persona Custom Instructions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific instructions for how XYBOT should interact when this profile ID is active."
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/15 text-xs text-white focus:border-cyan-400 outline-none resize-none"
                  />
                </div>

                {/* Avatar Selection */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                      Preset Avatars & Custom Photo
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCameraTarget('edit');
                          setIsCameraOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Take Selfie</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarUpload(e, false)}
                    />
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => {
                          setSelectedAvatarUrl(av.url);
                          setUser((prev) => ({ ...prev, avatar: av.url }));
                        }}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                          selectedAvatarUrl === av.url ? 'border-cyan-400 scale-105 shadow-md' : 'border-white/10 opacity-70 hover:opacity-100'
                        }`}
                        title={av.name}
                      >
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-lg" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveActiveProfile}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-md"
                >
                  Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Done button */}
        <div className="pt-3 border-t border-white/10 flex-shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-white/40">
            Active ID: <span className="text-cyan-400 font-semibold">{user.name}</span>
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold tracking-wide transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>

      {/* Selfie Camera Capture Modal */}
      <SelfieCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(photoDataUrl) => {
          if (cameraTarget === 'edit') {
            setSelectedAvatarUrl(photoDataUrl);
            setUser((prev) => ({ ...prev, avatar: photoDataUrl }));
            updateProfile(user.id, { avatar: photoDataUrl });
            showToast({ type: 'success', title: 'Selfie Avatar Applied!' });
          } else {
            setNewAvatarUrl(photoDataUrl);
            showToast({ type: 'success', title: 'Selfie Captured for New ID!' });
          }
        }}
        onSwitchToUpload={() => {
          if (cameraTarget === 'edit') {
            fileInputRef.current?.click();
          } else {
            newFileInputRef.current?.click();
          }
        }}
      />
    </div>
  );
};
