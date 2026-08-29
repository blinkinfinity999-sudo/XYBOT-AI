import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, FlipHorizontal, Sparkles, Upload, AlertCircle, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../../lib/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onSwitchToUpload?: () => void;
}

export const SelfieCameraModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCapture,
  onSwitchToUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [useTimer, setUseTimer] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'cyber' | 'warm' | 'mono'>('normal');
  const [flash, setFlash] = useState(false);

  // Initialize camera when opened
  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera(cameraFacing);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async (facing: 'user' | 'environment') => {
    setErrorMsg(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let message = 'Unable to access camera. Please check camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device found on this system.';
      }
      setErrorMsg(message);
    }
  };

  const toggleFacing = () => {
    sounds.playClick();
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
  };

  const triggerCapture = () => {
    if (useTimer) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            takeSnapshot();
            return null;
          }
          sounds.playClick();
          return prev - 1;
        });
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    sounds.triggerHaptic('heavy');
    sounds.playClick();

    // Trigger visual flash
    setFlash(true);
    setTimeout(() => setFlash(false), 250);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We want a square avatar photo (e.g. 512x512)
    const size = Math.min(video.videoWidth || 512, video.videoHeight || 512);
    canvas.width = 512;
    canvas.height = 512;

    const startX = ((video.videoWidth || 512) - size) / 2;
    const startY = ((video.videoHeight || 512) - size) / 2;

    // If facing user, mirror the image horizontally for natural selfie
    ctx.save();
    if (cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Apply color filters
    if (activeFilter === 'mono') {
      ctx.filter = 'grayscale(100%) contrast(120%)';
    } else if (activeFilter === 'cyber') {
      ctx.filter = 'contrast(120%) saturate(140%) hue-rotate(15deg)';
    } else if (activeFilter === 'warm') {
      ctx.filter = 'sepia(30%) saturate(120%) brightness(105%)';
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    sounds.playClick();
    setCapturedPhoto(null);
    startCamera(cameraFacing);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      sounds.playSuccess();
      onCapture(capturedPhoto);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-md bg-[#0e0e12] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl relative flex flex-col items-center"
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Camera className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-tight">Selfie Camera Snap</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Captured Photo Area */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-black border-2 border-cyan-400/40 shadow-inner flex items-center justify-center">
          {/* Flash animation */}
          {flash && <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-300" />}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
              <span className="text-6xl font-black text-cyan-400 animate-ping">{countdown}</span>
            </div>
          )}

          {errorMsg ? (
            <div className="p-4 text-center text-white/70 flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-xs">{errorMsg}</p>
              {onSwitchToUpload && (
                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                    onSwitchToUpload();
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo Instead</span>
                </button>
              )}
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured Selfie"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${
                  cameraFacing === 'user' ? '-scale-x-100' : ''
                } ${
                  activeFilter === 'mono'
                    ? 'grayscale contrast-125'
                    : activeFilter === 'cyber'
                    ? 'contrast-125 saturate-150'
                    : activeFilter === 'warm'
                    ? 'sepia-[0.3] saturate-125'
                    : ''
                }`}
              />

              {/* Target Guides / Reticle */}
              <div className="absolute inset-4 rounded-full border border-cyan-400/30 pointer-events-none" />
              <div className="absolute inset-0 border-[3px] border-cyan-400/20 rounded-3xl pointer-events-none" />
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-cyan-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>LIVE</span>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Filters & Camera Controls */}
        {!capturedPhoto && !errorMsg && (
          <div className="w-full mt-4 space-y-3">
            {/* Filter Pills */}
            <div className="flex items-center justify-center gap-1.5">
              {(['normal', 'cyber', 'warm', 'mono'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeFilter === filter
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60 shadow-sm'
                      : 'bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Shutter & Quick Options Bar */}
            <div className="flex items-center justify-around pt-2">
              <button
                onClick={() => setUseTimer(!useTimer)}
                className={`p-2.5 rounded-2xl border transition-all ${
                  useTimer
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                }`}
                title={useTimer ? '3s Timer Enabled' : 'Instant Shutter'}
              >
                <Timer className="w-4 h-4" />
              </button>

              {/* Big Shutter Button */}
              <button
                onClick={triggerCapture}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-1 shadow-[0_0_20px_rgba(0,242,255,0.4)] active:scale-90 transition-transform"
                title="Take Photo"
              >
                <div className="w-full h-full rounded-full border-2 border-black bg-white flex items-center justify-center">
                  <Camera className="w-6 h-6 text-black" />
                </div>
              </button>

              {/* Flip Facing Camera button */}
              <button
                onClick={toggleFacing}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all"
                title="Flip Front / Rear Camera"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Post-Capture Actions */}
        {capturedPhoto && (
          <div className="w-full mt-4 flex gap-2.5">
            <button
              onClick={handleRetake}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake</span>
            </button>

            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Use as Avatar</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
