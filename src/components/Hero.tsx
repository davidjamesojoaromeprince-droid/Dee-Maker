import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Code2, ShieldCheck, Zap, PhoneCall } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

interface HeroProps {
  onBookCallClick?: () => void;
  videoUrl?: string;
}

export const Hero: React.FC<HeroProps> = ({ onBookCallClick, videoUrl: propVideoUrl }) => {
  const { t } = useLanguage();
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>(propVideoUrl || '');
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (propVideoUrl) {
      setHeroVideoUrl(propVideoUrl);
      return;
    }
    const loadHeroMedia = async () => {
      try {
        const siteDoc = await getDoc(doc(db, 'siteData', 'main'));
        if (siteDoc.exists() && siteDoc.data()?.heroVideoUrl) {
          setHeroVideoUrl(siteDoc.data().heroVideoUrl);
          return;
        }
        const aboutDoc = await getDoc(doc(db, 'about', 'main'));
        if (aboutDoc.exists() && aboutDoc.data()?.heroVideoUrl) {
          setHeroVideoUrl(aboutDoc.data().heroVideoUrl);
        }
      } catch (_) {}
    };
    loadHeroMedia();
  }, [propVideoUrl]);

  const scrollToForm = () => {
    const el = document.getElementById('intake-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="home" 
      className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-[#0B1020] border-b border-indigo-900/40 overflow-hidden"
    >
      {/* Background Media: Looping Video or Ken Burns Handshake Photo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {heroVideoUrl && !videoFailed ? (
          <video
            key={heroVideoUrl}
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80"
            onError={() => setVideoFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center animate-ken-burns"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
        )}
        {/* Colorful Dark Gradient Overlay so bold white text stays readable */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 20, 80, 0.78) 0%, rgba(76, 29, 149, 0.65) 100%)'
          }}
        />
      </div>

      {/* Background Ambient Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow z-1" />
      <div className="absolute bottom-0 right-10 w-[350px] h-[350px] bg-pink-500/15 rounded-full blur-[100px] pointer-events-none z-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-cyan-300 border border-white/20 mb-6 shadow-xl backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-cyan-400 animate-pulse" />
            {t.heroTagline}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            {t.heroHeadline} <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">{t.heroHeadlineHighlight}</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-200 font-bold leading-relaxed mb-8 max-w-2xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {t.heroSubtext}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl glow-btn text-white font-black text-base transition-all cursor-pointer border border-white/20 shadow-2xl"
            >
              {t.heroCtaStart}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>

            {onBookCallClick && (
              <button
                onClick={onBookCallClick}
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-slate-900/90 text-white font-black text-base hover:bg-slate-800 transition-colors cursor-pointer border border-indigo-500/30 backdrop-blur-md shadow-lg"
              >
                <PhoneCall className="w-4.5 h-4.5 mr-2 text-cyan-400" />
                {t.heroCtaCall}
              </button>
            )}

            <a
              href="#portfolio"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-white/10 text-white border border-white/30 font-black text-base hover:bg-white hover:text-slate-950 transition-all backdrop-blur-md"
            >
              {t.heroCtaDemos}
            </a>
          </div>

          {/* Avatar Social Proof */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full border-2 border-slate-900 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                JD
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-slate-900 bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                MS
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-slate-900 bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black flex items-center justify-center text-xs shadow-md">
                AK
              </div>
            </div>
            <p className="text-sm text-slate-200 font-bold drop-shadow-xs">
              Trusted by 20+ clients across 5 countries
            </p>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/15 text-left">
            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-xl hover:border-indigo-500/40 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-black text-white">24+ Apps Shipped</h4>
                <p className="text-xs text-slate-300 font-medium mt-0.5">iOS, Android, and web products launched.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-xl hover:border-indigo-500/40 transition-colors">
              <Code2 className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-black text-white">Direct Communication</h4>
                <p className="text-xs text-slate-300 font-medium mt-0.5">WhatsApp & email updates directly from Dee-Maker.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-xl hover:border-indigo-500/40 transition-colors">
              <ShieldCheck className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-black text-white">App Store & Launch</h4>
                <p className="text-xs text-slate-300 font-medium mt-0.5">Complete deployment and source code transfer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
