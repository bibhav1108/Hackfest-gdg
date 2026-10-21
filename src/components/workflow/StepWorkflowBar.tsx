import React from 'react';
import { Search, UserCheck, MapPin, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface StepWorkflowBarProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
  hasResult: boolean;
  isHitlConfirmed?: boolean;
}

export const StepWorkflowBar: React.FC<StepWorkflowBarProps> = ({
  currentStep,
  onStepClick,
  hasResult,
  isHitlConfirmed = false,
}) => {
  const steps = [
    {
      step: 1,
      title: '1. Input & Discovery',
      desc: 'Type brand, scan Rx slip, voice, or wildcard',
      icon: Search,
      enabled: true,
      badge: null,
    },
    {
      step: 2,
      title: '2. HITL Selection & Verification',
      desc: 'Human-in-the-loop candidate confirmation & salt check',
      icon: UserCheck,
      enabled: hasResult,
      badge: isHitlConfirmed ? 'Verified' : 'Review',
    },
    {
      step: 3,
      title: '3. Locate Kendra & Dispense',
      desc: 'Live store stock, WhatsApp slip, & counter card',
      icon: MapPin,
      enabled: hasResult,
      badge: null,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step || (s.step === 1 && hasResult);

          return (
            <React.Fragment key={s.step}>
              <button
                type="button"
                onClick={() => onStepClick(s.step as 1 | 2 | 3)}
                disabled={!s.enabled}
                className={`flex-1 flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-700 shadow-xs'
                    : s.enabled
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isDone && !isActive ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs font-bold leading-tight truncate ${
                        isActive
                          ? 'text-teal-950 dark:text-teal-100'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {s.title}
                    </span>
                    {s.badge && (
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                          s.badge === 'Verified'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {s.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden md:block mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="hidden sm:flex items-center justify-center text-slate-300 dark:text-slate-700 px-1">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
