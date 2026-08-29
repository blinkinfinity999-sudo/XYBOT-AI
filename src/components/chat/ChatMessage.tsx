import React, { useState, memo } from 'react';
import { Message } from '../../types';
import { useApp } from '../../context/AppContext';
import { XYBotLogo } from '../common/XYBotLogo';
import { 
  Copy, 
  Check, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Edit2, 
  Sparkles, 
  User, 
  FileText,
  Clock,
  Pin
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sounds } from '../../lib/soundEffects';

interface Props {
  message: Message;
  isLatest: boolean;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
}

export const ChatMessage: React.FC<Props> = memo(({
  message,
  isLatest,
  isStreaming = false,
  onRegenerate,
  onEdit,
}) => {
  const { user, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    showToast({ type: 'success', title: 'Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast({ type: 'error', title: 'TTS Not Supported', message: 'Speech synthesis is unavailable in this browser.' });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for smooth audio narration
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*#_`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Choose natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(editText.trim());
      setIsEditing(false);
      showToast({ type: 'success', title: 'Message Updated' });
    }
  };

  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id={`message_${message.id}`}
      className={`group relative flex gap-2.5 sm:gap-4 transition-all ${
        isUser
          ? 'bg-[#181822] border border-white/10 rounded-2xl sm:rounded-3xl rounded-tr-sm py-2 px-3 sm:py-3.5 sm:px-5 max-w-[88%] sm:max-w-2xl ml-auto text-slate-100 shadow-md'
          : 'glass rounded-2xl sm:rounded-3xl rounded-tl-sm py-3 px-3.5 sm:py-4 sm:px-6 max-w-full sm:max-w-3xl mr-auto shadow-xl'
      }`}
    >
      {/* Avatar - Only shown for AI assistant, removed for user reply */}
      {!isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <XYBotLogo size={28} isPremium={user.plan !== 'free'} />
        </div>
      )}

      {/* Message Content & Controls */}
      <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
        {/* Header line: Role name & timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`text-[11px] sm:text-xs font-bold tracking-wide ${isUser ? 'text-cyan-300/90' : 'neon-text'}`}>
              {isUser ? user.name : 'XYBOT AI'}
            </span>
            <span className="text-[9px] sm:text-[10px] text-white/40 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {timeStr}
            </span>
          </div>

          {/* Action buttons (Copy, Speak, Edit, Regenerate) */}
          <div className="flex items-center gap-0.5 sm:gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              title="Copy message"
              className="p-1 sm:p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>

            {!isUser && (
              <button
                onClick={handleSpeech}
                title={isSpeaking ? 'Stop narration' : 'Listen with TTS'}
                className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
                  isSpeaking ? 'text-[#00f2ff] bg-cyan-950/60 animate-pulse' : 'text-white/40 hover:text-[#00f2ff] hover:bg-white/5'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              </button>
            )}

            {isUser && onEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                title="Edit message"
                className="p-1 sm:p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}

            {!isUser && isLatest && onRegenerate && !isStreaming && (
              <button
                onClick={onRegenerate}
                title="Regenerate response"
                className="p-1 sm:p-1.5 rounded-lg text-white/40 hover:text-[#00f2ff] hover:bg-white/5 transition-colors"
              >
                <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Attachments preview if present */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="relative rounded-2xl overflow-hidden border border-white/10 max-w-xs shadow-md bg-[#0d0d0d]"
              >
                {att.type === 'image' ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="max-h-60 w-auto object-cover rounded-xl"
                  />
                ) : (
                  <div className="p-3 flex items-center gap-2 text-xs text-[#00f2ff]">
                    <FileText className="w-4 h-4" />
                    <span className="truncate max-w-[160px]">{att.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text Content / Edit Box */}
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-2xl bg-[#050505] border border-white/20 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00f2ff]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#7000ff] text-white text-xs font-bold transition-colors"
              >
                Save & Update
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-100 leading-relaxed font-normal overflow-hidden break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
                h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-3 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold text-[#00f2ff] mt-3 mb-1.5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-purple-300 mt-2 mb-1">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-slate-200">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-slate-200">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#00f2ff] pl-3 my-2 text-white/70 italic bg-white/5 py-1 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 rounded-xl border border-white/10">
                    <table className="min-w-full text-xs text-left divide-y divide-white/10">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-white/5 text-[#00f2ff] font-semibold">{children}</thead>,
                th: ({ children }) => <th className="px-3 py-2">{children}</th>,
                td: ({ children }) => <td className="px-3 py-2 border-t border-white/10 text-slate-300">{children}</td>,
                code: ({ node, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  const codeString = String(children).replace(/\n$/, '');

                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-[#00f2ff] font-mono text-[12px] border border-white/10">
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="my-3 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-xl">
                      <div className="flex items-center justify-between px-4 py-1.5 bg-black/40 border-b border-white/10 text-[11px] font-mono text-white/50">
                        <span className="font-semibold text-[#00f2ff] uppercase">{match ? match[1] : 'CODE'}</span>
                        <button
                          onClick={() => {
                            sounds.playClick();
                            navigator.clipboard.writeText(codeString);
                            showToast({ type: 'success', title: 'Code Copied' });
                          }}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-cyan-100 overflow-x-auto leading-relaxed">
                        <code>{children}</code>
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Streaming Cursor */}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-[#00f2ff] animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
