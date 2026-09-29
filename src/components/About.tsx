import React from 'react';
import { AboutData } from '../types';
import { UserCheck, Terminal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutProps {
  data: AboutData;
}

export const About: React.FC<AboutProps> = ({ data }) => {
  const { t } = useLanguage();

  return (
    <section id="about" className="relative py-20 md:py-28 bg-[#0B1020] border-b border-indigo-900/40 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Summary Box / Avatar Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg border border-white/20">
                  DM
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Dee-Maker</h3>
                  <p className="text-sm font-bold text-cyan-300">Software Studio & App Engineering</p>
                  <p className="text-xs text-slate-400 mt-0.5">High-Performance Mobile & Web</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10 mb-6">
                <div>
                  <div className="text-3xl font-black text-white">{data.yearsExperience}+</div>
                  <div className="text-xs font-bold text-slate-400 mt-0.5">{t.aboutYearsExp}</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-cyan-400">{data.appsBuilt}+</div>
                  <div className="text-xs font-bold text-slate-400 mt-0.5">{t.aboutAppsShipped}</div>
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Core Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white/10 text-slate-200 text-xs font-bold rounded-lg border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Story Content */}
          <div className="lg:col-span-7">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
              {t.aboutBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4 mb-6">
              {data.title || t.aboutTitle}
            </h2>

            <div className="text-slate-300 text-base font-medium leading-relaxed space-y-4 whitespace-pre-line">
              {data.story}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-start space-x-3">
                <UserCheck className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Collaboration</h4>
                  <p className="text-xs text-slate-400 mt-0.5">No account managers. You get direct access to the developer writing your code.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Terminal className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Modern Code Quality</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Built with React, TypeScript, and modern scalable server architectures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
