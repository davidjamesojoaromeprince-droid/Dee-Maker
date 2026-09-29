import React from 'react';
import { Smartphone, Lock, Mail, MessageSquare, ArrowUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onOpenProducerPortal: () => void;
  isProducerUnlocked: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenProducerPortal, isProducerUnlocked }) => {
  const { t } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B1020] text-slate-400 py-12 border-t border-indigo-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center space-x-2.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md border border-white/20">
                <Smartphone className="w-4.5 h-4.5" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">DEE-MAKER<span className="text-pink-500">.</span></span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              {t.footerRights}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3">Navigation</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="hover:text-white transition-colors">{t.navHome}</a></li>
                <li><a href="#portfolio" className="hover:text-white transition-colors">{t.navPortfolio}</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">{t.navAbout}</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">{t.navTestimonials}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3">Support & FAQs</h4>
              <ul className="space-y-2">
                <li><a href="#faq" className="hover:text-white transition-colors">{t.navFaq}</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">{t.navContact}</a></li>
                <li><a href="#intake-form" className="hover:text-white transition-colors">{t.navPricing}</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-3 text-xs space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3">Direct Channels</h4>
            <a href="mailto:deemakers01@gmail.com" className="flex items-center text-slate-300 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 mr-2 text-blue-500" />
              deemakers01@gmail.com
            </a>
            <a href="https://wa.me/2348059264736" target="_blank" rel="noopener noreferrer" className="flex items-center text-slate-300 hover:text-emerald-400 transition-colors">
              <MessageSquare className="w-3.5 h-3.5 mr-2 text-emerald-500" />
              WhatsApp: 08059264736
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} Dee-Maker. {t.footerRights}
          </div>

          <div className="flex items-center space-x-6">
            {/* Unobtrusive Producer Mark */}
            <button
              onClick={onOpenProducerPortal}
              className="inline-flex items-center text-slate-500 hover:text-slate-300 transition-colors text-xs cursor-pointer"
              title="Producer Admin Access (Passcode: web001)"
            >
              <Lock className="w-3 h-3 mr-1 text-slate-600" />
              <span>{isProducerUnlocked ? 'Producer Portal Active' : t.footerProducerAccess}</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
