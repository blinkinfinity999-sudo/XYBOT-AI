import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AetherLogo } from './AetherLogo';
import { Lock, Unlock, ShieldAlert, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

export const PasscodeModal: React.FC = () => {
  const { isAppLocked, unlockApp, settings } = useApp();
  const [pin, setPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState<boolean>(false);

  if (!isAppLocked) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === (settings.passcodeHash ? settings.passcodeHash.length : 4)) {
        setTimeout(() => {
          const success = unlockApp(nextPin);
          if (!success) {
            setErrorShake(true);
            setTimeout(() => {
              setPin('');
              setErrorShake(false);
            }, 500);
          }
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div
      id="passcode_lock_overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/95 backdrop-blur-2xl p-4"
    >
      <motion.div
        animate={errorShake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center text-center p-8 rounded-3xl bg-[#0d0d0d] border border-white/10 shadow-[0_0_50px_rgba(0,242,255,0.1)]"
      >
        <div className="p-2 rounded-2xl neon-border mb-4">
          <AetherLogo size={56} />
        </div>
        
        <div className="flex items-center gap-2 text-[#00f2ff] font-semibold text-sm tracking-wider uppercase mb-1">
          <Lock className="w-4 h-4" />
          <span>Security Matrix</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Enter App Passcode</h2>
        <p className="text-xs text-white/50 mb-6">Enter your security PIN to unlock Aether AI assistant</p>

        {/* PIN Indicators */}
        <div className="flex gap-3 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                pin.length > index
                  ? 'bg-[#00f2ff] border-[#00f2ff] shadow-[0_0_10px_#00f2ff]'
                  : 'border-white/20 bg-white/5'
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((item) => {
            return (
              <button
                key={item}
                onClick={() => {
                  if (item === 'C') setPin('');
                  else if (item === '⌫') handleBackspace();
                  else handleDigit(item);
                }}
                className="h-14 rounded-2xl glass hover:bg-white/10 active:bg-white/20 active:scale-95 border border-white/10 hover:border-white/20 text-xl font-medium text-white transition-all flex items-center justify-center shadow-md"
              >
                {item}
              </button>
            );
          })}
        </div>

        {settings.passcodeHash && (
          <button
            onClick={() => {
              if (window.confirm("Forgot passcode? This will require logging back in.")) {
                unlockApp(settings.passcodeHash || '');
              }
            }}
            className="text-xs text-white/40 hover:text-[#00f2ff] transition-colors mt-2"
          >
            Forgot PIN?
          </button>
        )}
      </motion.div>
    </div>
  );
};
