import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { PricingTier } from '../types';
import { Check, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { fadeInReveal, staggerContainer, liquidHover, tapScale } from '../lib/motionPresets';

interface PricingProps {
  items?: PricingTier[];
  onSelectTier?: (tierName: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ items, onSelectTier }) => {
  const { t } = useLanguage();
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(items || []);
  const [isLoading, setIsLoading] = useState(!items || items.length === 0);

  useEffect(() => {
    if (items && items.length > 0) {
      setPricingTiers(items);
      setIsLoading(false);
      return;
    }

    const fetchPricing = async (retries = 5, delay = 800) => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            setPricingTiers(data.pricingTiers || []);
            setIsLoading(false);
            return;
          }
        }
        if (retries > 0) {
          setTimeout(() => fetchPricing(retries - 1, delay * 1.5), delay);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => fetchPricing(retries - 1, delay * 1.5), delay);
        } else {
          setIsLoading(false);
        }
      }
    };
    fetchPricing();
  }, [items]);

  if (isLoading) return null;

  return (
    <section id="pricing" className="relative py-32 overflow-hidden bg-slate-50/70">
      {/* Ambient Liquid Background Flourishes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] bg-gradient-to-br from-blue-200/40 to-indigo-200/20 rounded-full blur-[130px] animate-float-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-gradient-to-tr from-amber-200/20 via-sky-100/30 to-transparent rounded-full blur-[120px] animate-float-reverse" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInReveal}
          className="mb-20 text-center"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={tapScale}
            className="inline-flex items-center gap-2 rounded-full bg-blue-50/90 border border-blue-200/60 px-4 py-2 text-sm font-bold text-blue-600 mb-6 shadow-xs backdrop-blur-xs cursor-default"
          >
            <Zap size={16} className="text-amber-500 fill-amber-500" />
            <span>Pricing & Services</span>
          </motion.div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl uppercase">
            Built for <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Scale.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-slate-500">
            Transparent, milestone-based pricing for founders who want to build fast and correctly.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-3"
        >
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.id}
              variants={fadeInReveal}
              whileHover={{
                y: -8,
                scale: tier.popular ? 1.04 : 1.02,
                boxShadow: tier.popular 
                  ? '0 32px 64px -12px rgba(37,99,235,0.22), 0 0 20px -3px rgba(245,158,11,0.12)' 
                  : '0 24px 48px -12px rgba(37,99,235,0.12)',
                transition: { type: 'spring', stiffness: 350, damping: 24 }
              }}
              whileTap={tapScale}
              className={`relative flex flex-col rounded-[32px] p-8 transition-all duration-300 ${
                tier.popular 
                  ? 'bg-white shadow-[0_24px_50px_-12px_rgba(37,99,235,0.16)] border-2 border-blue-600 z-10' 
                  : 'bg-white/85 backdrop-blur-xs border border-slate-200/80 hover:border-blue-300 shadow-xs'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/30">
                  <Sparkles size={14} className="text-amber-300 fill-amber-300" />
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{tier.name}</h3>
                <p className="mt-2 text-sm font-bold text-slate-400">{tier.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter text-slate-900">{tier.price}</span>
                  <span className="text-sm font-bold text-slate-400">/{tier.period}</span>
                </div>
              </div>

              <ul className="mb-10 space-y-4 flex-1">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-blue-50 p-1 text-blue-600 shrink-0 border border-blue-100/60 shadow-2xs">
                      <Check size={14} className="stroke-[3px]" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest border-t border-slate-100 pt-4">
                  <span className="text-slate-400">Turnaround</span>
                  <span className="text-blue-600 font-black">{tier.turnaround}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.025, y: -1 }}
                  whileTap={tapScale}
                  onClick={() => onSelectTier?.(tier.name)}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-5 font-black uppercase tracking-widest text-sm transition-all cursor-pointer ${
                    tier.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'
                  }`}
                >
                  <span>Start Project</span>
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
