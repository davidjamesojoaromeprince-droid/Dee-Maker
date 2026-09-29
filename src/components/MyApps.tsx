import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Download, Cpu, History } from 'lucide-react';
import { MyApp } from '../types';
import { fadeInReveal, tapScale, liquidHover, staggerContainer, springTransition } from '../lib/motionPresets';

interface MyAppsProps {
  apps: MyApp[];
}

const MyApps: React.FC<MyAppsProps> = ({ apps = [] }) => {
  if (!apps || apps.length === 0) return null;

  const handleDownload = (url: string, fileName: string) => {
    if (!url) return;
    
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (fileName) {
        link.download = fileName;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download/open failed:', error);
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="my-apps" className="relative py-28 bg-[#0B1020] border-b border-indigo-900/40 overflow-hidden">
      {/* Background liquid wash */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[120px] pointer-events-none animate-float-reverse" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInReveal}
          className="text-center mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={tapScale}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-cyan-300 text-xs font-black uppercase tracking-widest mb-4 shadow-lg backdrop-blur-md cursor-default"
          >
            <Smartphone size={14} className="text-cyan-400" />
            <span>Proprietary Products</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
            Dee-Maker <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Products.</span>
          </h2>
          <p className="text-lg font-medium text-slate-300 max-w-2xl mx-auto">
            Beyond client builds, we develop and maintain our own specialized mobile and web applications.
            Download test builds to test our native performance and craft.
          </p>
        </motion.div>

        <div className="space-y-24">
          {apps.map((app, index) => (
            <motion.div
              key={app.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInReveal}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-transparent rounded-3xl opacity-40 blur-2xl group-hover:opacity-70 transition-opacity"></div>
                  <motion.div 
                    variants={staggerContainer}
                    className="relative flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
                  >
                    {app.images.map((img, i) => (
                      <motion.div
                        key={i}
                        variants={fadeInReveal}
                        whileHover={liquidHover}
                        whileTap={tapScale}
                        className="flex-shrink-0 w-[280px] aspect-[9/19] rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-900 snap-center transition-all"
                      >
                        <img src={img} alt={`${app.name} screenshot ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">{app.name}</h3>
                  <p className="text-slate-300 font-medium leading-relaxed text-lg">{app.description}</p>
                </div>

                <div className="space-y-6">
                  <motion.div whileHover={{ x: 4 }} transition={springTransition} className="flex gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl backdrop-blur-xl">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-cyan-300 border border-blue-400/30">
                      <Cpu size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase tracking-tight flex items-center gap-2">
                        How it was made
                      </h4>
                      <p className="text-slate-300 font-medium text-sm mt-1">{app.howItWasMade}</p>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ x: 4 }} transition={springTransition} className="flex gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl backdrop-blur-xl">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-pink-300 border border-purple-400/30">
                      <History size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase tracking-tight flex items-center gap-2">
                        Latest Updates
                      </h4>
                      <p className="text-slate-300 font-medium text-sm mt-1">{app.updateNotes}</p>
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  {app.downloadUrl && (
                    <motion.button
                      whileHover={{ 
                        scale: 1.03, 
                        y: -2,
                        boxShadow: '0 18px 36px -6px rgba(124, 58, 237, 0.45)'
                      }}
                      whileTap={tapScale}
                      transition={springTransition}
                      onClick={() => handleDownload(app.downloadUrl!, app.fileName || `${app.name.toLowerCase().replace(/\s+/g, '-')}-build`)}
                      className="glow-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-xl transition-all cursor-pointer border border-white/20"
                    >
                      <Download size={20} className="text-cyan-300" />
                      <span>Download Build</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyApps;
