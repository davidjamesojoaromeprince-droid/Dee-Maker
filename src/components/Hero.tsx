import React from 'react';
import { ArrowRight, CheckCircle2, Code2, ShieldCheck, Zap, PhoneCall } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onBookCallClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookCallClick }) => {
  const { t } = useLanguage();

  const scrollToForm = () => {
    const el = document.getElementById('intake-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="pt-12 pb-16 md:pt-20 md:pb-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-6 shadow-xs">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            {t.heroTagline}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            {t.heroHeadline} <span className="text-blue-600">{t.heroHeadlineHighlight}</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-600 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
            {t.heroSubtext}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 shadow-xl shadow-blue-900/10 transition-all cursor-pointer"
            >
              {t.heroCtaStart}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>

            {onBookCallClick && (
              <button
                onClick={onBookCallClick}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-4.5 h-4.5 mr-2 text-blue-400" />
                {t.heroCtaCall}
              </button>
            )}

            <a
              href="#portfolio"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-base hover:bg-gray-100 transition-colors"
            >
              {t.heroCtaDemos}
            </a>
          </div>

          {/* Avatar Social Proof */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full border-2 border-white bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shadow-xs">
                JD
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-white bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shadow-xs">
                MS
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-white bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs shadow-xs">
                AK
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Trusted by 20+ clients across 5 countries
            </p>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-left">
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50/70 border border-gray-100 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-gray-900">24+ Apps Shipped</h4>
                <p className="text-xs text-gray-500 mt-0.5">iOS, Android, and web products launched.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50/70 border border-gray-100 shadow-2xs">
              <Code2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-gray-900">Direct Communication</h4>
                <p className="text-xs text-gray-500 mt-0.5">WhatsApp & email updates directly from Dee-Maker.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50/70 border border-gray-100 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-gray-900">App Store & Launch</h4>
                <p className="text-xs text-gray-500 mt-0.5">Complete deployment and source code transfer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
