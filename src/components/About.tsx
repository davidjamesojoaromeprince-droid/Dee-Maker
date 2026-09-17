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
    <section id="about" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Summary Box / Avatar Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  DM
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Dee-Maker</h3>
                  <p className="text-sm font-medium text-blue-600">Software Studio & App Engineering</p>
                  <p className="text-xs text-slate-500 mt-0.5">High-Performance Mobile & Web</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-6">
                <div>
                  <div className="text-3xl font-extrabold text-slate-900">{data.yearsExperience}+</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{t.aboutYearsExp}</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-blue-600">{data.appsBuilt}+</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{t.aboutAppsShipped}</div>
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
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/50"
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
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/80 px-3 py-1 rounded-full">
              {t.aboutBadge}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-3 mb-6">
              {data.title || t.aboutTitle}
            </h2>

            <div className="prose prose-slate text-slate-600 text-base leading-relaxed space-y-4 whitespace-pre-line">
              {data.story}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
              <div className="flex items-start space-x-3">
                <UserCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Direct Collaboration</h4>
                  <p className="text-xs text-slate-500 mt-0.5">No account managers. You get direct access to the developer writing your code.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Terminal className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Modern Code Quality</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Built with React, TypeScript, and modern scalable server architectures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
