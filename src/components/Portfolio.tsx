import React, { useState } from 'react';
import { ExternalLink, Video, Code } from 'lucide-react';
import { PortfolioItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PortfolioProps {
  items: PortfolioItem[];
  onOpenIntake?: (config?: { appName?: string; description?: string; tier?: string; projectType?: 'app' | 'website' }) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ items, onOpenIntake }) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  // Derive categories
  const categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
            {t.portfolioBadge}
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-3">
            {t.portfolioTitle || t.portfolioHeader}
          </h2>
          <p className="text-slate-600 mt-2">
            {t.portfolioSub || t.portfolioSubheader}
          </p>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Image Header */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {item.category}
                  </span>

                  {item.videoUrl && (
                    <button
                      onClick={() => setActiveVideoModal(item.videoUrl)}
                      className="absolute bottom-3 right-3 inline-flex items-center space-x-1.5 bg-blue-600/90 hover:bg-blue-700 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t.portfolioWatchDemo || 'Watch Demo'}</span>
                    </button>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Tech Stack Pills */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                        <div className="flex items-center space-x-1">
                          <Code className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tech Stack:</span>
                        </div>
                        {onOpenIntake && (
                          <button
                            type="button"
                            onClick={() => onOpenIntake({
                              appName: `App similar to ${item.title}`,
                              description: `I am interested in building a project with architecture/features inspired by ${item.title}.`,
                              tier: 'MVP Mobile Sprint',
                              projectType: 'app'
                            })}
                            className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            Request Similar App &rarr;
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Link Modal */}
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Project Video Demo</h3>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {activeVideoModal.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) ||
              activeVideoModal.includes('portfolio-uploads') ? (
                <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
                  <video
                    src={activeVideoModal}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-600 text-sm mb-6">
                    Click below to open the external video demo in a new tab.
                  </p>
                  <a
                    href={activeVideoModal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
                  >
                    Open External Video
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
