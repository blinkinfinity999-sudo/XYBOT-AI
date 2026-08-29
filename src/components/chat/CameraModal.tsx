import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Sparkles, AlertCircle, SwitchCamera } from 'lucide-react';
import { motion } from 'motion/react';
import { sounds } from '../../lib/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string, prompt?: string) => void;
}

export const CameraModal: React.FC<Props> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Analyze this image and explain what you see in detail.');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode, capturedImage]);

  const startCamera = async () => {
    setPermissionError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setPermissionError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings to scan images.'
          : 'Unable to access device camera. Please check camera hardware and permissions.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleTakeSnapshot = () => {
    sounds.playClick();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    sounds.playClick();
    setCapturedImage(null);
  };

  const handleSendToAI = () => {
    if (capturedImage) {
      sounds.playSend();
      onCapture(capturedImage, prompt);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera_capture_modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-[#060913] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto flex flex-col items-center"
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Camera className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-wide">Aether Vision Scanner</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport container */}
        <div className="relative w-full aspect-video sm:aspect-4/3 bg-black rounded-2xl overflow-hidden border border-cyan-500/30 flex items-center justify-center shadow-inner">
          {permissionError ? (
            <div className="p-6 text-center text-slate-300 max-w-sm flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-rose-400 animate-bounce" />
              <h4 className="text-sm font-bold text-white">Camera Access Required</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{permissionError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
              >
                Request Permission Again
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured frame"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Futuristic scanning reticle overlay */}
              <div className="absolute inset-4 border border-cyan-400/40 rounded-xl pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-400/20" />
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-400/20" />
              </div>
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Action Controls */}
        <div className="w-full mt-4 space-y-3">
          {capturedImage ? (
            <>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Vision Prompt for AI
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Solve this equation / Extract all text / Describe objects"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSendToAI}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Transmit to Aether AI</span>
                </button>
                <button
                  onClick={handleRetake}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>
            </>
          ) : (
            !permissionError && (
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Switch camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>

                {/* Shutter Button */}
                <button
                  onClick={handleTakeSnapshot}
                  className="w-16 h-16 rounded-full border-4 border-cyan-400 p-1 bg-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_20px_#22d3ee]"
                >
                  <div className="w-full h-full rounded-full bg-cyan-400 hover:bg-cyan-300 transition-colors" />
                </button>

                <div className="w-11" /> {/* Balanced spacer */}
              </div>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
};
