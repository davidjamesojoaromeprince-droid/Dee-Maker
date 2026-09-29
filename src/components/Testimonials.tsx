import React from 'react';
import { Star, Quote, Building2 } from 'lucide-react';
import { Testimonial } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TestimonialsProps {
  items: Testimonial[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ items }) => {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="relative py-20 md:py-28 bg-[#0B1020] border-b border-indigo-900/40 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
            {t.testimonialsBadge}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            {t.testimonialsTitle}
          </h2>
          <p className="text-slate-300 mt-2 font-medium">
            {t.testimonialsSub}
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-indigo-500/60 transition-all shadow-2xl group"
            >
              <div>
                {/* Star Ratings */}
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-xs" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-cyan-400/40 mb-3" />

                <p className="text-slate-200 text-sm leading-relaxed italic mb-6 font-medium">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{item.clientName}</h4>
                  <p className="text-xs text-slate-400 font-medium">{item.role}</p>
                </div>
                <div className="flex items-center text-xs text-cyan-300 font-bold bg-white/10 px-2.5 py-1 rounded-xl border border-white/15">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                  {item.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
