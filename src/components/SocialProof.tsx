import React from 'react';
import { Clock, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SocialProofProps {
  appsBuilt?: number;
  onBookCallClick?: () => void;
}

export const SocialProof: React.FC<SocialProofProps> = ({ appsBuilt = 24, onBookCallClick }) => {
  const { t } = useLanguage();

  const clients = [
    { name: 'BrightCafes', category: 'Retail & Loyalty' },
    { name: 'Vance Logistics', category: 'Fleet & Dispatch' },
    { name: 'FitPulse Health', category: 'Biometrics & Fitness' },
    { name: 'SwiftLend', category: 'P2P Marketplace' },
    { name: 'OmniRoute', category: 'Supply Chain' },
  ];

  return (
    <section className="py-10 bg-slate-900 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mb-8 pb-8 border-b border-slate-800 text-center">
          
          {/* Response Time Badge */}
          <div className="inline-flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-full shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Clock className="w-4 h-4 text-emerald-400 ml-1" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {t.socialResponseTime}
            </span>
          </div>

          {/* Delivery Stat Badge */}
          {onBookCallClick ? (
            <button
              onClick={onBookCallClick}
              className="inline-flex items-center space-x-2 text-slate-300 hover:text-white text-xs sm:text-sm font-medium cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>{t.socialOnTime} • <span className="text-blue-400 underline">{t.socialBookCallLink}</span></span>
            </button>
          ) : (
            <div className="inline-flex items-center space-x-2 text-slate-300 text-xs sm:text-sm font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>{t.socialOnTime}</span>
            </div>
          )}

          {/* Apps Built Badge */}
          <div className="inline-flex items-center space-x-2 text-slate-300 text-xs sm:text-sm font-medium">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{appsBuilt}+ {t.socialAppsBuilt}</span>
          </div>

        </div>

        {/* Client Logos / Brand Trust */}
        <div className="text-center">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-6">
            {t.socialTrustedBy}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-16 opacity-85">
            {clients.map((c) => (
              <div key={c.name} className="flex items-center space-x-2 group cursor-default">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:bg-blue-600/30 transition-all">
                  {c.name.charAt(0)}
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold tracking-tight text-slate-200 group-hover:text-white transition-colors block">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block -mt-0.5">
                    {c.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
