import React from 'react';
import { Send, FileText, Code2, Rocket, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HowItWorksProps {
  onStartRequest?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartRequest }) => {
  const { t } = useLanguage();

  const handleStartRequest = () => {
    if (onStartRequest) {
      onStartRequest();
    } else {
      const intakeElem = document.getElementById('intake-form');
      if (intakeElem) {
        intakeElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const steps = [
    {
      number: '01',
      icon: Send,
      title: '1. Submit Inquiry',
      time: '1–2 Minutes',
      description: 'Fill out the simple intake form with your app title, target platform, and core features.',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      number: '02',
      icon: FileText,
      title: '2. Direct Quote & Call',
      time: 'Within 24 Hours',
      description: 'Dee-Maker reviews your request, estimates scope, and sends a clear milestone proposal or schedules a 15-min discovery call.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      number: '03',
      icon: Code2,
      title: '3. Weekly Sprint Builds',
      time: '3–8 Weeks',
      description: 'Active development with weekly test builds delivered every Friday. direct WhatsApp & email progress updates.',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      number: '04',
      icon: Rocket,
      title: '4. Store Launch & Handover',
      time: 'Final Milestone',
      description: 'App Store & Google Play submission, production server deployment, and 100% full source code ownership transfer.',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 bg-[#0B1020] border-b border-indigo-900/40 overflow-hidden">
      {/* Ambient Color Blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-cyan-300 border border-white/15 mb-4 backdrop-blur-md shadow-lg">
            {t.howItWorksBadge}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            {t.howItWorksHeader}
          </h2>
          <p className="text-lg text-slate-300 font-medium leading-relaxed">
            {t.howItWorksSubheader}
          </p>
        </div>

        {/* 4 Steps Horizontal / Vertical Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-slate-900/60 rounded-3xl p-6 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col justify-between relative hover:border-indigo-500/60 hover:shadow-[0_0_30px_rgba(79,70,229,0.25)] transition-all group"
              >
                <div>
                  {/* Top Step Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-slate-600 font-mono">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Title & Time */}
                  <h3 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-300 border border-white/15 mb-3">
                    {step.time}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector indicator for non-last items */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-900 rounded-full p-1.5 border border-white/20 text-slate-400 shadow-md">
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 bg-gradient-to-r from-slate-900/90 via-indigo-950/80 to-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-black text-white">{t.howItWorksBannerTitle}</h4>
            <p className="text-sm text-slate-300 font-medium mt-1">{t.howItWorksBannerSub}</p>
          </div>
          <button
            onClick={handleStartRequest}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glow-btn text-white font-black text-sm transition-all cursor-pointer border border-white/20 shadow-xl whitespace-nowrap"
          >
            {t.howItWorksCta}
          </button>
        </div>

      </div>
    </section>
  );
};
