import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FAQProps {
  items: FAQItem[];
}

export const FAQ: React.FC<FAQProps> = ({ items }) => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-20 md:py-28 bg-[#0B1020] border-b border-indigo-900/40 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
            {t.faqBadge}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            {t.faqTitle}
          </h2>
          <p className="text-slate-300 mt-2 text-sm font-medium">
            {t.faqSub}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.id}
                className="bg-slate-900/60 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-white/20"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg pr-4">{item.question}</span>
                  <div
                    className={`w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent' : ''
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-slate-300 text-sm leading-relaxed border-t border-white/10 whitespace-pre-line font-medium">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
