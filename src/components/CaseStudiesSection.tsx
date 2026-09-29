import React, { useState } from 'react';
import { BookOpen, ArrowRight, X, Code2 } from 'lucide-react';
import { CaseStudy } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CaseStudiesSectionProps {
  caseStudies: CaseStudy[];
}

export const CaseStudiesSection: React.FC<CaseStudiesSectionProps> = ({ caseStudies }) => {
  const { t } = useLanguage();
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);

  if (!caseStudies || caseStudies.length === 0) return null;

  return (
    <section id="case-studies" className="relative py-20 sm:py-28 bg-[#0B1020] border-b border-indigo-900/40 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-cyan-300 border border-white/15 mb-4 backdrop-blur-md">
            {t.caseStudiesBadge}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            {t.caseStudiesTitle}
          </h2>
          <p className="text-lg text-slate-300 font-medium leading-relaxed">
            {t.caseStudiesSub}
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((cs) => (
            <div
              key={cs.id}
              className="bg-slate-900/60 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl hover:border-indigo-500/60 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badge */}
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={cs.imageUrl}
                    alt={cs.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/15">
                    {cs.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-xs font-black text-cyan-400 uppercase tracking-wider mb-1">
                    Client: {cs.client}
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-cyan-300 transition-colors uppercase tracking-tight">
                    {cs.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4 line-clamp-3">
                    {cs.summary}
                  </p>

                  {/* Key Metrics Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cs.metrics.slice(0, 3).map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div className="px-6 pb-6 pt-0">
                <button
                  onClick={() => setSelectedCaseStudy(cs)}
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest border border-white/15 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{t.caseStudiesReadBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Case Study Detail Modal */}
      {selectedCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#0B1020] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-white/20 relative my-8 max-h-[90vh] overflow-y-auto text-white">
            
            <button
              onClick={() => setSelectedCaseStudy(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10 border border-white/15"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-1">
                Case Study • {selectedCaseStudy.category}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 uppercase tracking-tight">
                {selectedCaseStudy.title}
              </h3>
              <p className="text-sm font-bold text-slate-400">
                Client: {selectedCaseStudy.client}
              </p>
            </div>

            {/* Metrics Highlight */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 bg-indigo-950/60 rounded-2xl border border-white/15">
              {selectedCaseStudy.metrics.map((metric, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs font-black text-cyan-300 uppercase tracking-wider">{metric}</div>
                </div>
              ))}
            </div>

            {/* Structured Problem, Approach, Outcome */}
            <div className="space-y-6 text-sm text-slate-200 leading-relaxed mb-8">
              
              {/* Problem */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-white/10">
                <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-rose-400 flex items-center space-x-1.5">
                  <span>The Problem</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {selectedCaseStudy.problem}
                </p>
              </div>

              {/* Approach */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-white/10">
                <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-cyan-400 flex items-center space-x-1.5">
                  <span>Dee-Maker's Engineering Approach</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {selectedCaseStudy.approach}
                </p>
              </div>

              {/* Outcome */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-white/10">
                <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-emerald-400 flex items-center space-x-1.5">
                  <span>The Measurable Outcome</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {selectedCaseStudy.outcome}
                </p>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center space-x-1 text-slate-400">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Technologies & Architecture</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCaseStudy.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/15"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedCaseStudy(null)}
                className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors cursor-pointer shadow-lg"
              >
                Close Case Study
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
