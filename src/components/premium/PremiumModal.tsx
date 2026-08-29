import React, { useState } from 'react';
import { useApp, PLANS } from '../../context/AppContext';
import { XYBotLogo } from '../common/XYBotLogo';
import { Crown, Sparkles, Check, Zap, X, Shield, Clock, Flame, AlertOctagon, KeyRound, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { PlanType } from '../../types';

export const PremiumModal: React.FC = () => {
  const { isPremiumModalOpen, closePremiumModal, user, upgradePlan, cancelPlan, settings } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelPin, setCancelPin] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isPremiumModalOpen) return null;

  const handleUpgrade = (plan: PlanType) => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#a855f7', '#fbbf24', '#ffffff'],
        });
      } catch {}

      upgradePlan(plan);
      setIsProcessing(false);
    }, 600);
  };

  const handlePinDigit = (digit: string) => {
    if (cancelPin.length < 4) {
      const nextPin = cancelPin + digit;
      setCancelPin(nextPin);
      setPinError(false);
    }
  };

  const handleBackspace = () => {
    setCancelPin((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handleConfirmCancel = () => {
    if (cancelPin.length !== 4) {
      setPinError(true);
      return;
    }

    const success = cancelPlan(cancelPin);
    if (success) {
      setShowCancelPrompt(false);
      setCancelPin('');
    } else {
      setPinError(true);
      setTimeout(() => {
        setCancelPin('');
      }, 600);
    }
  };

  const isCurrentPremium = user.plan !== 'free';

  return (
    <div
      id="premium_membership_modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.15)] relative my-auto"
      >
        {/* Floating Close Button */}
        <button
          onClick={() => {
            setShowCancelPrompt(false);
            setCancelPin('');
            closePremiumModal();
          }}
          className="absolute top-5 right-5 text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CANCELLATION 4-DIGIT PIN AUTH SCREEN */}
        <AnimatePresence mode="wait">
          {showCancelPrompt ? (
            <motion.div
              key="cancel_pin_screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center py-4"
            >
              <button
                onClick={() => {
                  setShowCancelPrompt(false);
                  setCancelPin('');
                  setPinError(false);
                }}
                className="self-start mb-4 text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Plans</span>
              </button>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-3">
                <AlertOctagon className="w-8 h-8" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Authorize Plan Cancellation
              </h2>
              <p className="text-xs text-white/50 max-w-md mb-6 leading-relaxed">
                Please enter the 4-digit security PIN code created during account initialization to confirm downgrading your subscription to the Free tier.
              </p>

              {/* PIN Bubbles Display */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = cancelPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        isFilled
                          ? pinError
                            ? 'bg-rose-500 border-rose-500 shadow-[0_0_12px_#f43f5e]'
                            : 'bg-[#00f2ff] border-[#00f2ff] shadow-[0_0_12px_#00f2ff]'
                          : 'border-white/20 bg-white/5'
                      }`}
                    />
                  );
                })}
              </div>

              {pinError && (
                <p className="text-xs font-semibold text-rose-400 mb-4 animate-pulse">
                  Incorrect 4-digit passcode PIN. Please try again.
                </p>
              )}

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mb-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') {
                        setCancelPin('');
                        setPinError(false);
                      } else if (btn === '⌫') {
                        handleBackspace();
                      } else {
                        handlePinDigit(btn);
                      }
                    }}
                    className="h-12 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-95 border border-white/10 text-base font-bold text-white transition-all flex items-center justify-center shadow-sm"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full max-w-[280px]">
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 transition-all"
                >
                  Keep Plan
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelPin.length !== 4}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    cancelPin.length === 4
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  }`}
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="plans_selection_screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Top Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-2">
                  <XYBotLogo size={56} isPremium={true} />
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 p-1 rounded-full shadow-lg">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>XYBOT VIP Access</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Elevate Your AI Experience
                </h2>
                <p className="text-xs sm:text-sm text-white/50 max-w-md mt-1">
                  Unlock higher image generation quotas, ultra-fast neural processing, and dedicated multimodal vision tools.
                </p>

                {/* Current plan badge & cancel option */}
                <div className="mt-4 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 flex flex-wrap items-center justify-between gap-3 w-full max-w-lg">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[#00f2ff] font-semibold">
                      <Shield className="w-3.5 h-3.5" /> Current: {PLANS[user.plan].name}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      {user.plan === 'free' ? '4 Free image generations' : `Active VIP subscription`}
                    </span>
                  </div>

                  {isCurrentPremium && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCancelPrompt(true);
                        setCancelPin('');
                        setPinError(false);
                      }}
                      className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold text-[11px] transition-all flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Cancel Plan</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Pricing Tier Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                {(['starter', 'pro', 'ultimate'] as PlanType[]).map((planKey) => {
                  const plan = PLANS[planKey];
                  const isSelected = selectedPlan === planKey;
                  const isCurrent = user.plan === planKey;

                  return (
                    <div
                      key={planKey}
                      onClick={() => setSelectedPlan(planKey)}
                      className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white/5 border-2 border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.2)] scale-[1.02]'
                          : 'glass hover:bg-white/5 border border-white/10'
                      }`}
                    >
                      {/* Popular Ribbon */}
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-current" />
                          <span>Most Popular</span>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-bold text-white">{plan.name}</h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-white/40 block mb-3 font-medium">{plan.duration}</span>

                        <div className="flex items-baseline gap-1 my-2">
                          <span className="text-3xl font-extrabold text-white tracking-tight">{plan.price}</span>
                          <span className="text-xs text-white/40 font-normal">/ period</span>
                        </div>

                        <div className="p-2.5 my-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 text-center">
                          {plan.imageLimit === 'unlimited' ? '✨ Unlimited Images' : `🖼️ ${plan.imageLimit} Image Generations`}
                        </div>

                        {/* Bullet points */}
                        <ul className="space-y-2 mt-4 text-xs text-white/70">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpgrade(planKey);
                        }}
                        disabled={isCurrent || isProcessing}
                        className={`w-full mt-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                          isCurrent
                            ? 'bg-white/5 text-white/30 cursor-default'
                            : isSelected
                            ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 active:scale-95'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isCurrent ? 'Current Plan' : isProcessing ? 'Activating...' : `Upgrade (${plan.price})`}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Guarantee footer */}
              <div className="flex items-center justify-center gap-6 text-[11px] text-white/40 pt-2 border-t border-white/5">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Instant Activation
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Secure Sandbox Billing
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#00f2ff]" /> Resets Automatically
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
