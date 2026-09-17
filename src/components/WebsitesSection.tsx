import React from 'react';
import { motion } from 'motion/react';
import { Globe, ArrowRight, Layout, Zap, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { PortfolioItem } from '../types';
import { fadeInReveal, staggerContainer, liquidHover, tapScale } from '../lib/motionPresets';

interface WebsitesSectionProps {
  items: PortfolioItem[];
  onOpenIntake?: (config?: { tier?: string; appName?: string; description?: string; projectType?: 'app' | 'website' }) => void;
}

export const WebsitesSection: React.FC<WebsitesSectionProps> = ({ items = [], onOpenIntake }) => {
  const websiteItems = (items || []).filter(item => 
    item.category?.toLowerCase().includes('website') || 
    item.category?.toLowerCase().includes('web app') ||
    item.category?.toLowerCase().includes('web') ||
    item.category?.toLowerCase().includes('system') ||
    item.category?.toLowerCase().includes('dashboard') ||
    item.category?.toLowerCase().includes('portal')
  );

  return (
    <section id="websites" className="py-24 bg-white border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInReveal}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
              <Globe size={14} className="text-blue-600" />
              <span>Websites & Cloud Platforms</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight">
              Scalable Web <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Solutions.</span>
            </h2>
            <p className="text-base sm:text-lg font-medium text-slate-500">
              From high-converting landing pages to complex SaaS portals and custom business dashboards.
              Dee-Maker builds fast, SEO-optimized, and resilient web infrastructure.
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap gap-4"
          >
            <motion.div variants={fadeInReveal} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 text-slate-600 text-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center">
                <Layout size={14} />
              </div>
              <span className="font-bold uppercase tracking-widest text-[11px]">Responsive UI</span>
            </motion.div>
            <motion.div variants={fadeInReveal} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 text-slate-600 text-xs">
              <div className="w-6 h-6 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
                <Zap size={14} />
              </div>
              <span className="font-bold uppercase tracking-widest text-[11px]">Sub-Second Speed</span>
            </motion.div>
          </motion.div>
        </div>

        {websiteItems.length === 0 ? (
          /* High-Craft Empty State / Upcoming Feature Showcase */
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInReveal}
            className="rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-8 sm:p-12 text-center"
          >
            <div className="max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-100/80 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
                <Globe className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles size={12} className="text-blue-600" />
                <span>Custom Builds Available Now</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">
                Need a Custom Web App or Business Portal?
              </h3>
              <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed mb-8">
                We design and engineer bespoke web applications, customer portals, billing dashboards, and responsive marketing sites tailored to your company's exact workflow.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <Layers className="w-5 h-5 text-blue-600 mb-2" />
                  <h4 className="text-xs font-black uppercase text-slate-900 mb-1 tracking-wider">Full-Stack SaaS</h4>
                  <p className="text-xs text-slate-500 font-medium">React, Node, Postgres, and real-time sockets.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
                  <h4 className="text-xs font-black uppercase text-slate-900 mb-1 tracking-wider">Secure Portals</h4>
                  <p className="text-xs text-slate-500 font-medium">Role-based access control, Stripe, & analytics.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <Zap className="w-5 h-5 text-amber-500 mb-2" />
                  <h4 className="text-xs font-black uppercase text-slate-900 mb-1 tracking-wider">Rapid Delivery</h4>
                  <p className="text-xs text-slate-500 font-medium">Live interactive prototypes in 2 to 4 weeks.</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.025 }}
                whileTap={tapScale}
                onClick={() => onOpenIntake?.({ projectType: 'website', tier: 'Website & Web App', appName: 'Custom Web Platform' })}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Request a Custom Web Platform</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {websiteItems.map((item) => (
              <motion.div
                key={item.id}
                variants={fadeInReveal}
                whileHover={liquidHover}
                className="group bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                       <span className="text-white text-xs font-bold uppercase tracking-widest">{item.category}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 line-clamp-3">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {item.techStack.map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 pt-0 flex items-center justify-between gap-3 border-t border-slate-200/60 mt-auto">
                  <button
                    type="button"
                    onClick={() => onOpenIntake?.({
                      projectType: 'website',
                      appName: `Inquiry about ${item.title}`,
                      description: `I would like to build a web platform similar to ${item.title}.`
                    })}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    <span>Request Similar System</span>
                    <ArrowRight size={14} />
                  </button>

                  {item.videoUrl && (
                    <motion.a 
                      whileHover={{ x: 3 }}
                      whileTap={tapScale}
                      href={item.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700"
                    >
                      Demo
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

