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
    <section id="testimonials" className="py-16 md:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
            {t.testimonialsBadge}
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-3">
            {t.testimonialsTitle}
          </h2>
          <p className="text-slate-600 mt-2">
            {t.testimonialsSub}
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-blue-50/50 rounded-2xl p-6 sm:p-8 border border-blue-100 flex flex-col justify-between hover:bg-blue-50/80 transition-colors shadow-xs"
            >
              <div>
                {/* Star Ratings */}
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-blue-200 mb-3" />

                <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.clientName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{item.role}</p>
                </div>
                <div className="flex items-center text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-blue-500" />
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
