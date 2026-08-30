import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { XYBotLogo } from '../common/XYBotLogo';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Radio, 
  RotateCcw, 
  MessageSquare,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../../lib/soundEffects';

export const VoiceChatModal: React.FC = () => {
  const { setActiveView, showToast, user } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiSpeechResponse, setAiSpeechResponse] = useState('');
  const [conversationLogs, setConversationLogs] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    startListening();
    return () => {
      stopListening();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast({ type: 'warning', title: 'Speech Recognition Unavailable', message: 'Use Chrome or Edge for voice AI loop.' });
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        sounds.playClick();
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
        transcriptRef.current = currentText;
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically transmit query when user finishes speaking
        const finalPhrase = transcriptRef.current.trim();
        if (finalPhrase) {
          handleSendVoiceQuery(finalPhrase);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleSendVoiceQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;

    stopListening();
    setIsProcessing(true);
    sounds.playSend();

    setConversationLogs((prev) => [...prev, { role: 'user', text: queryText }]);
    setTranscript('');
    transcriptRef.current = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: queryText }],
          stream: false,
          model: 'gemini-2.5-flash',
          systemInstruction: 'You are XYBOT Voice Core. Respond in a highly conversational, warm, and extremely concise manner. Limit your response strictly to 1 or 2 simple sentences (max 30 words) with no markdown, formatting, list items, or special characters, as this will be read aloud immediately.',
        }),
      });

      const rawText = await response.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { text: rawText };
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Neural speech response failed');
      }

      const replyText = data.text || 'Understood, Commander.';
      setAiSpeechResponse(replyText);
      setConversationLogs((prev) => [...prev, { role: 'assistant', text: replyText }]);

      // Speak response aloud
      speakAI(replyText);
    } catch (err: any) {
      console.error(err);
      sounds.playError();
      showToast({ type: 'error', title: 'Voice Error', message: err.message });
      setIsProcessing(false);
    }
  };

  const speakAI = (text: string) => {
    if (!synthRef.current) {
      setIsProcessing(false);
      return;
    }

    synthRef.current.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').slice(0, 500); // Clean Markdown
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsProcessing(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Automatically resume listening for continuous hands-free conversation
      setTimeout(() => {
        startListening();
      }, 500);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsProcessing(false);
    };

    synthRef.current.speak(utterance);
  };

  const handleInterrupt = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    startListening();
  };

  return (
    <div
      id="voice_chat_live_viewport"
      className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-4 py-6 justify-between relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
          <h2 className="text-base font-bold text-white tracking-wide">Live Neural Voice Matrix</h2>
        </div>
        <button
          onClick={() => setActiveView('chat')}
          className="p-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Central Holographic Neural Orb */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 relative">
        {/* Glowing concentric wave rings */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{
              scale: isSpeaking ? [1, 1.3, 1] : isListening ? [1, 1.15, 1] : [1, 1.05, 1],
              opacity: isSpeaking ? [0.6, 0.9, 0.6] : [0.3, 0.6, 0.3],
            }}
            transition={{ repeat: Infinity, duration: isSpeaking ? 1.2 : 2.5, ease: 'easeInOut' }}
            className={`w-64 h-64 rounded-full blur-3xl absolute ${
              isSpeaking
                ? 'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500'
                : isListening
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600'
                : 'bg-cyan-600/30'
            }`}
          />

          {/* Sphere Center */}
          <div className="w-40 h-40 rounded-full bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-[#060913] border-2 border-cyan-400/60 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.4)] relative z-10">
            <XYBotLogo size={64} />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-8 text-center z-10 space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-300">
            {isSpeaking
              ? 'XYBOT Speaking...'
              : isProcessing
              ? 'XYBOT Neural Core Thinking...'
              : isListening
              ? 'Listening to you...'
              : 'Tap Mic to Speak'}
          </span>
        </div>

        {/* Live Transcript / Response Preview */}
        <div className="mt-4 max-w-md w-full text-center px-4 min-h-[60px] z-10 flex items-center justify-center">
          {transcript ? (
            <p className="text-sm font-medium text-white italic">"{transcript}"</p>
          ) : aiSpeechResponse && !transcript ? (
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
              {aiSpeechResponse}
            </p>
          ) : (
            <p className="text-xs text-slate-500">Ask any question or command naturally...</p>
          )}
        </div>
      </div>

      {/* Bottom Voice Controls */}
      <div className="flex flex-col items-center gap-4 z-10 pb-4">
        {/* Transmit button if user spoken */}
        {transcript && !isProcessing && (
          <button
            onClick={() => handleSendVoiceQuery(transcript)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-cyan-500/30 active:scale-95 transition-all"
          >
            Send "{transcript.slice(0, 25)}..."
          </button>
        )}

        <div className="flex items-center gap-6">
          {/* Interrupt Speaking */}
          {isSpeaking && (
            <button
              onClick={handleInterrupt}
              className="p-3.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Interrupt and speak"
            >
              <VolumeX className="w-5 h-5 text-rose-400" />
            </button>
          )}

          {/* Main Mic Toggle Shutter */}
          <button
            onClick={() => {
              if (isListening) {
                if (transcript.trim()) {
                  handleSendVoiceQuery(transcript);
                } else {
                  stopListening();
                }
              } else {
                startListening();
              }
            }}
            className={`w-18 h-18 rounded-full border-4 p-1 flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
              isListening
                ? 'border-rose-400 shadow-[0_0_30px_#f43f5e] bg-rose-500/20'
                : 'border-cyan-400 shadow-[0_0_30px_#22d3ee] bg-cyan-500/20'
            }`}
          >
            <div
              className={`w-full h-full rounded-full flex items-center justify-center text-white transition-colors ${
                isListening ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
            >
              {isListening ? <Mic className="w-6 h-6 animate-pulse" /> : <MicOff className="w-6 h-6" />}
            </div>
          </button>

          {/* Switch to text chat */}
          <button
            onClick={() => setActiveView('chat')}
            className="p-3.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Switch to text mode"
          >
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
