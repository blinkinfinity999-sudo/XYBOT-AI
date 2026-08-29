import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CameraModal } from './CameraModal';
import { 
  Send, 
  Camera, 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Square, 
  Paperclip, 
  X, 
  Sparkles, 
  FileText,
  Wand2
} from 'lucide-react';
import { Attachment } from '../../types';
import { sounds } from '../../lib/soundEffects';

interface Props {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isGenerating: boolean;
  onStopGenerating?: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<Props> = ({
  onSendMessage,
  isGenerating,
  onStopGenerating,
  placeholder = "Message XYBOT AI...",
}) => {
  const { showToast } = useApp();
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  // Voice Speech Recognition Setup
  const toggleSpeechRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
      return;
    }

    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast({ 
        type: 'warning', 
        title: 'Speech Recognition Unavailable', 
        message: 'Your browser does not support Web Speech API. Try Chrome or Edge.' 
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        sounds.playClick();
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
        showToast({ type: 'info', title: 'Listening...', message: 'Speak clearly into your microphone.' });
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        stopSpeechRecognition();
        showToast({ type: 'error', title: 'Microphone Error', message: 'Microphone permission or connection issue.' });
      };

      recognition.onend = () => {
        stopSpeechRecognition();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error(e);
      showToast({ type: 'error', title: 'Mic Access Failed', message: e.message });
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        showToast({ type: 'error', title: 'File Too Large', message: 'Attachments must be under 15MB.' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newAttachment: Attachment = {
          id: 'att_' + Math.random().toString(36).substring(2, 9),
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: base64,
          mimeType: file.type || 'application/octet-stream',
          name: file.name,
          size: file.size,
          base64: base64,
        };
        setAttachments((prev) => [...prev, newAttachment]);
        sounds.playClick();
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    sounds.playClick();
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCameraCapture = (base64Image: string, promptText?: string) => {
    const newAtt: Attachment = {
      id: 'att_cam_' + Date.now(),
      type: 'image',
      url: base64Image,
      mimeType: 'image/jpeg',
      name: 'camera_capture.jpg',
      base64: base64Image,
    };
    const finalAttachments = [...attachments, newAtt];
    const text = promptText || inputText || 'Analyze this camera scan in detail.';
    onSendMessage(text, finalAttachments);
    setInputText('');
    setAttachments([]);
  };

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isGenerating) return;
    sounds.playSend();
    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
    if (isRecording) stopSpeechRecognition();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div id="chat_input_container" className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-2 sm:pb-4">
      {/* Attachments Preview Row */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative group rounded-xl sm:rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-900/90 shadow-lg flex items-center p-1 pr-2.5 gap-1.5 sm:gap-2"
            >
              {att.type === 'image' ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg sm:rounded-xl"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
              <div className="flex flex-col max-w-[100px] sm:max-w-[120px]">
                <span className="text-[11px] sm:text-xs font-semibold text-white truncate">{att.name}</span>
                <span className="text-[9px] sm:text-[10px] text-cyan-400 font-mono">
                  {att.size ? `${(att.size / 1024).toFixed(0)} KB` : 'Ready'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="ml-0.5 p-1 rounded-md sm:rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-300 transition-colors"
                title="Remove attachment"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Voice Wave Visualizer Banner when recording */}
      {isRecording && (
        <div className="flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2 mb-1.5 sm:mb-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-rose-950/80 border border-rose-500/40 text-rose-300 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              Voice Active • {recordingSeconds}s
            </span>
          </div>
          <button
            onClick={stopSpeechRecognition}
            className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] sm:text-xs font-bold"
          >
            Done
          </button>
        </div>
      )}

      {/* Main Glass Input Bar */}
      <div className="relative flex flex-col rounded-2xl sm:rounded-3xl glass focus-within:border-[#00f2ff]/60 focus-within:shadow-[0_0_20px_rgba(0,242,255,0.15)] transition-all shadow-xl p-1.5 sm:p-2.5">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-transparent px-2.5 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none resize-none min-h-[34px] sm:min-h-[40px] max-h-32 sm:max-h-48 leading-relaxed"
        />

        {/* Input Bar Action Toolbar */}
        <div className="flex items-center justify-between pt-0.5 sm:pt-1 px-0.5 sm:px-1">
          {/* Left attachment buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Camera Button */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-white/60 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
              title="Open Device Camera"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Gallery / File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-white/60 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
              title="Upload Image or Document from Gallery"
            >
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf,text/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleSpeechRecording}
              className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl active:scale-95 transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white shadow-[0_0_12px_#f43f5e]'
                  : 'text-white/60 hover:text-rose-400 hover:bg-white/5'
              }`}
              title={isRecording ? 'Stop Recording' : 'Voice Input (Microphone)'}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>

          {/* Right Action: Send or Stop Generating */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGenerating}
                className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] sm:text-xs font-bold tracking-wide shadow-md active:scale-95 transition-all animate-pulse"
              >
                <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() && attachments.length === 0}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                  inputText.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-[#00f2ff] to-[#7000ff] hover:scale-105 text-white shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
