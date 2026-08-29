import React from 'react';
import { useApp } from '../../context/AppContext';
import { XYBotLogo } from './XYBotLogo';
import { HelpCircle, Info, Sparkles, Shield, Cpu, Zap, X, Globe, ExternalLink, CheckCircle, Brain, BookOpen, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  type: 'help' | 'about';
  onClose: () => void;
}

export const HelpAboutModal: React.FC<Props> = ({ type, onClose }) => {
  return (
    <div
      id="help_about_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[85vh]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            {type === 'help' ? (
              <HelpCircle className="w-5 h-5 text-[#00f2ff]" />
            ) : (
              <Info className="w-5 h-5 text-purple-400" />
            )}
            <h3 className="text-lg font-bold text-white tracking-wide">
              {type === 'help' ? 'Help & XYBOT Modes Guide' : 'About XYBOT AI Assistant'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {type === 'help' ? (
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="p-4 rounded-2xl glass border border-white/10">
              <h4 className="font-semibold text-[#00f2ff] flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" /> 5 Specialized AI Modes
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Switch modes using the dropdown in the header or the cards on the home screen:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-white/60 list-disc list-inside">
                <li><strong className="text-cyan-300">XY Base</strong>: Default blend of speed and cognitive depth.</li>
                <li><strong className="text-amber-300">XY Light</strong>: Optimized for super speed, low latency, and direct answers.</li>
                <li><strong className="text-purple-300">XY Creative</strong>: Tailored for image generation, artistic writing, and storytelling.</li>
                <li><strong className="text-emerald-300">XY Student</strong>: Homework and project helper with structured step-by-step guidance.</li>
                <li><strong className="text-rose-300">XY Neo</strong>: Deep reasoning, architectural thinking, and complex problem breakdown.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl glass border border-white/10">
              <h4 className="font-semibold text-purple-300 flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" /> AI Image Synthesis & Vision
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Generate artwork with custom aspect ratios, or click the Camera / Gallery button in chat to scan handwritten notes, diagrams, and formulas.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass border border-white/10">
              <h4 className="font-semibold text-blue-300 flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4" /> Live Voice Matrix
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Click the microphone icon for speech-to-text dictation or switch to Fullscreen Voice Mode in the sidebar for hands-free audio conversation.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass border border-white/10">
              <h4 className="font-semibold text-white flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" /> Privacy & Local Persistence
              </h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Your conversations and image galleries are cached securely on your local device. Use App Passcode in Settings to prevent unauthorized device access.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center text-center">
            <div className="p-2 rounded-2xl neon-border my-2">
              <XYBotLogo size={64} />
            </div>
            <h4 className="text-xl font-bold text-white mt-2">XYBOT <span className="neon-text">AI</span> Assistant</h4>
            <span className="px-3 py-1 mt-1 text-xs font-semibold uppercase tracking-wider text-[#00f2ff] bg-white/5 border border-white/10 rounded-full">
              Futuristic Multi-Mode Release v4.0
            </span>

            <p className="text-xs text-white/60 max-w-sm mt-4 leading-relaxed">
              Designed as an original, futuristic AI chatbot featuring 5 dedicated intelligence modes, cybernetic glassmorphism styling, and Gemini multimodal reasoning.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full mt-6 text-left">
              <div className="p-3 rounded-xl glass border border-white/10">
                <span className="text-[11px] text-white/40">Core Architecture</span>
                <p className="text-xs font-semibold text-white mt-0.5">Gemini 2.5 Flash & Pro</p>
              </div>
              <div className="p-3 rounded-xl glass border border-white/10">
                <span className="text-[11px] text-white/40">UI Theme</span>
                <p className="text-xs font-semibold text-white mt-0.5">Sophisticated Dark Glass</p>
              </div>
              <div className="p-3 rounded-xl glass border border-white/10">
                <span className="text-[11px] text-white/40">Neural Modes</span>
                <p className="text-xs font-semibold text-white mt-0.5">Base, Light, Creative, Student, Neo</p>
              </div>
              <div className="p-3 rounded-xl glass border border-white/10">
                <span className="text-[11px] text-white/40">Security Engine</span>
                <p className="text-xs font-semibold text-white mt-0.5">PIN App Lock & Local Cache</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 text-xs text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Google Gemini API Server-Side Active</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#7000ff] hover:brightness-110 text-white text-sm font-semibold tracking-wide shadow-lg shadow-cyan-500/25 active:scale-98 transition-all"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};
