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
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            {t.howItWorksBadge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t.howItWorksHeader}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
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
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between relative hover:shadow-md transition-all group"
              >
                <div>
                  {/* Top Step Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Title & Time */}
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {step.title}
                  </h3>
                  <div className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border mb-3 ${step.badgeColor}`}>
                    {step.time}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector indicator for non-last items */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 border border-slate-200 text-slate-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold text-slate-900">{t.howItWorksBannerTitle}</h4>
            <p className="text-sm text-slate-600">{t.howItWorksBannerSub}</p>
          </div>
          <button
            onClick={handleStartRequest}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer whitespace-nowrap"
          >
            {t.howItWorksCta}
          </button>
        </div>

      </div>
    </section>
  );
};
