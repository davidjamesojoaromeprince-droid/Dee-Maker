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
    <section id="pricing" className="relative py-32 overflow-hidden bg-[#0B1020] border-b border-indigo-900/40">
      {/* Ambient Liquid Background Flourishes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] bg-indigo-600/20 rounded-full blur-[130px] animate-float-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-pink-500/15 rounded-full blur-[120px] animate-float-reverse" />
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
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-bold text-cyan-300 mb-6 shadow-lg backdrop-blur-md cursor-default"
          >
            <Zap size={16} className="text-amber-400 fill-amber-400" />
            <span>Pricing & Services</span>
          </motion.div>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl uppercase">
            Built for <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Scale.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-slate-300">
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
                  ? '0 32px 64px -12px rgba(124,58,237,0.4), 0 0 30px rgba(236,72,153,0.3)' 
                  : '0 24px 48px -12px rgba(37,99,235,0.25)',
                transition: { type: 'spring', stiffness: 350, damping: 24 }
              }}
              whileTap={tapScale}
              className={`relative flex flex-col rounded-[32px] p-8 transition-all duration-300 backdrop-blur-xl ${
                tier.popular 
                  ? 'bg-slate-900/90 shadow-[0_24px_60px_-12px_rgba(124,58,237,0.35)] border-2 border-indigo-500 z-10' 
                  : 'bg-slate-900/60 border border-white/10 hover:border-indigo-500/50 shadow-xl'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-xl border border-white/20">
                  <Sparkles size={14} className="text-amber-300 fill-amber-300" />
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{tier.name}</h3>
                <p className="mt-2 text-sm font-bold text-slate-400">{tier.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter text-white">{tier.price}</span>
                  <span className="text-sm font-bold text-slate-400">/{tier.period}</span>
                </div>
              </div>

              <ul className="mb-10 space-y-4 flex-1">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-blue-500/20 p-1 text-cyan-400 shrink-0 border border-blue-400/30">
                      <Check size={14} className="stroke-[3px]" />
                    </div>
                    <span className="text-sm font-bold text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest border-t border-white/10 pt-4">
                  <span className="text-slate-400">Turnaround</span>
                  <span className="text-cyan-300 font-black">{tier.turnaround}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.025, y: -1 }}
                  whileTap={tapScale}
                  onClick={() => onSelectTier?.(tier.name)}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-5 font-black uppercase tracking-widest text-sm transition-all cursor-pointer border border-white/20 ${
                    tier.popular
                      ? 'glow-btn text-white shadow-xl'
                      : 'bg-white text-slate-950 hover:bg-slate-100 shadow-lg'
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
