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
    <section id="case-studies" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            {t.caseStudiesBadge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t.caseStudiesTitle}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {t.caseStudiesSub}
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((cs) => (
            <div
              key={cs.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badge */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={cs.imageUrl}
                    alt={cs.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    {cs.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                    Client: {cs.client}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {cs.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {cs.summary}
                  </p>

                  {/* Key Metrics Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cs.metrics.slice(0, 3).map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200/80 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.caseStudiesReadBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Case Study Detail Modal */}
      {selectedCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedCaseStudy(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                Case Study • {selectedCaseStudy.category}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                {selectedCaseStudy.title}
              </h3>
              <p className="text-sm font-medium text-slate-500">
                Client: {selectedCaseStudy.client}
              </p>
            </div>

            {/* Metrics Highlight */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 bg-blue-50/70 rounded-xl border border-blue-100">
              {selectedCaseStudy.metrics.map((metric, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs font-bold text-blue-900">{metric}</div>
                </div>
              ))}
            </div>

            {/* Structured Problem, Approach, Outcome */}
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed mb-8">
              
              {/* Problem */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-rose-600 flex items-center space-x-1.5">
                  <span>The Problem</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedCaseStudy.problem}
                </p>
              </div>

              {/* Approach */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-blue-600 flex items-center space-x-1.5">
                  <span>Dee-Maker's Engineering Approach</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedCaseStudy.approach}
                </p>
              </div>

              {/* Outcome */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-emerald-600 flex items-center space-x-1.5">
                  <span>The Measurable Outcome</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedCaseStudy.outcome}
                </p>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Code2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Technologies & Architecture</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCaseStudy.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCaseStudy(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
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
