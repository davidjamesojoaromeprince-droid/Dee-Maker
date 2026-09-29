import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Smartphone, 
  ArrowRight, 
  Star
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Pricing } from './components/Pricing';
import { BookCallModal } from './components/BookCallModal';
import { ProducerPortal } from './components/ProducerPortal';
import { AuthScreen } from './components/AuthScreen';
import { IntakeForm } from './components/IntakeForm';
import { Contact } from './components/Contact';
import MyApps from './components/MyApps';
import { WebsitesSection } from './components/WebsitesSection';
import { Footer } from './components/Footer';
import { FaqDetailPage } from './components/FaqDetailPage';
import { FloatingBookCall } from './components/FloatingBookCall';
import { CardSkeleton, PricingSkeleton, Skeleton } from './components/Skeleton';
import { AppData, FAQItem, PortfolioItem, Testimonial, PricingTier, CaseStudy, MyApp } from './types';
import { auth, db } from './lib/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { initialDefaultData } from './lib/initialData';
import { fadeInReveal, staggerContainer, tapScale, liquidHover, springTransition, pageFadeIn } from './lib/motionPresets';

export default function App() {
  const [isProducerPortalOpen, setIsProducerPortalOpen] = useState(false);
  const [isProducerUnlocked, setIsProducerUnlocked] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isBookCallOpen, setIsBookCallOpen] = useState(false);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [pendingIntakeConfig, setPendingIntakeConfig] = useState<{
    tier?: string;
    appName?: string;
    description?: string;
    projectType?: 'app' | 'website';
  } | null>(null);
  const [intakeInitialData, setIntakeInitialData] = useState<{
    tier?: string;
    appName?: string;
    description?: string;
    projectType?: 'app' | 'website';
  } | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        let configToUse = pendingIntakeConfig;
        if (!configToUse) {
          try {
            const stored = sessionStorage.getItem('pendingIntakeConfig');
            if (stored) {
              configToUse = JSON.parse(stored);
            }
          } catch (_) {}
        }
        if (configToUse) {
          setIntakeInitialData(configToUse);
          setPendingIntakeConfig(null);
          try {
            sessionStorage.removeItem('pendingIntakeConfig');
          } catch (_) {}
          setIsAuthOpen(false);
          setIsIntakeOpen(true);
        }
      }
    });
    return () => unsubscribe();
  }, [pendingIntakeConfig]);

  const handleOpenIntake = (config?: { tier?: string; appName?: string; description?: string; projectType?: 'app' | 'website' }) => {
    if (!auth.currentUser) {
      const cfg = config || {};
      setPendingIntakeConfig(cfg);
      try {
        sessionStorage.setItem('pendingIntakeConfig', JSON.stringify(cfg));
      } catch (_) {}
      setIsAuthOpen(true);
      return;
    }
    setIntakeInitialData(config);
    setIsIntakeOpen(true);
  };
  
  // Hydrate from localStorage or initialDefaultData immediately to avoid flash of blank content
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      const cached = localStorage.getItem('dee_maker_app_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.about && Array.isArray(parsed.portfolio)) {
          return { ...initialDefaultData, ...parsed };
        }
      }
    } catch (_) {}
    return initialDefaultData;
  });

  const [isLoading, setIsLoading] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Fetch public data from server with smooth exponential retry
  const isFetchingRef = useRef(false);

  const fetchPublicData = async (retries = 3, delay = 600) => {
    if (isFetchingRef.current && retries === 3) return;
    isFetchingRef.current = true;

    try {
      // 1. Try fetching from Firestore directly (Client-side SDK)
      try {
        const aboutDoc = await getDoc(doc(db, 'about', 'main'));
        if (aboutDoc.exists()) {
          const portfolioSnap = await getDocs(query(collection(db, 'portfolio'), orderBy('createdAt', 'desc')));
          const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
          const faqsSnap = await getDocs(collection(db, 'faqs'));
          const pricingSnap = await getDocs(collection(db, 'pricing_tiers'));
          const myAppsSnap = await getDocs(collection(db, 'my_apps'));
          const caseStudiesSnap = await getDocs(collection(db, 'case_studies'));

          let heroVidUrl = (aboutDoc.data() as any)?.heroVideoUrl || '';
          try {
            const siteDoc = await getDoc(doc(db, 'siteData', 'main'));
            if (siteDoc.exists() && siteDoc.data()?.heroVideoUrl !== undefined) {
              heroVidUrl = siteDoc.data()?.heroVideoUrl;
            }
          } catch (_) {}

          const firestoreData: AppData = {
            about: { ...(aboutDoc.data() as any), heroVideoUrl: heroVidUrl },
            portfolio: portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() })) as PortfolioItem[],
            testimonials: testimonialsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Testimonial[],
            faqs: faqsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as FAQItem[],
            pricingTiers: pricingSnap.docs.map(d => ({ id: d.id, ...d.data() })) as PricingTier[],
            myApps: myAppsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as MyApp[],
            caseStudies: caseStudiesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as CaseStudy[]
          };

          if (firestoreData.about) {
            setAppData(prev => ({ ...prev, ...firestoreData }));
            try {
              localStorage.setItem('dee_maker_app_data', JSON.stringify(firestoreData));
            } catch (_) {}
            setIsLoading(false);
            isFetchingRef.current = false;
            return;
          }
        }
      } catch (fsErr) {
        console.warn("[Firestore] Direct fetch failed, falling back to API:", fsErr);
      }

      // 2. Fallback to API proxy (Server-side Firestore / Local Cache)
      const response = await fetch('/api/data');
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data: AppData = await response.json();
          if (data && data.about) {
            setAppData(prev => ({ ...prev, ...data }));
            try {
              localStorage.setItem('dee_maker_app_data', JSON.stringify(data));
            } catch (_) {}
            setIsLoading(false);
            isFetchingRef.current = false;
            return;
          }
        }
      }
      
      // If server is warming up or returning HTML during startup, retry with backoff
      if (retries > 0) {
        setTimeout(() => {
          isFetchingRef.current = false;
          fetchPublicData(retries - 1, Math.min(delay * 1.5, 5000));
        }, delay);
      } else {
        // Fallback to local default data silently
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => {
          isFetchingRef.current = false;
          fetchPublicData(retries - 1, Math.min(delay * 1.5, 5000));
        }, delay);
      } else {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }
  };

  useEffect(() => {
    fetchPublicData();

    const handleFocus = () => fetchPublicData();
    window.addEventListener('focus', handleFocus);

    // Periodic live sync every 30 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchPublicData();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans antialiased">
        <div className="fixed top-0 left-0 right-0 h-16 border-b border-slate-100 flex items-center px-8">
          <Skeleton className="h-8 w-32" />
          <div className="ml-auto flex gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        <main className="pt-32 pb-20 px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Skeleton className="h-10 w-48 rounded-full" />
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-3/4" />
              </div>
              <Skeleton className="h-6 w-full max-w-md" />
              <div className="flex gap-4">
                <Skeleton className="h-14 w-40 rounded-2xl" />
                <Skeleton className="h-14 w-40 rounded-2xl" />
              </div>
            </div>
            <Skeleton className="hidden lg:block aspect-[4/5] rounded-[40px] max-w-[450px] mx-auto" />
          </div>

          <div className="max-w-7xl mx-auto mt-32">
            <Skeleton className="h-10 w-64 mx-auto mb-16" />
            <div className="grid md:grid-cols-3 gap-8">
              <PricingSkeleton />
              <PricingSkeleton />
              <PricingSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 font-sans antialiased text-slate-900">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[70] shadow-[0_0_10px_rgba(37,99,235,0.5)]"
        style={{ scaleX }}
      />

      <Navbar 
        onOpenProducerPrompt={() => setIsBookCallOpen(true)} 
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenIntake={() => handleOpenIntake()}
      />
      
      {activeFaqId ? (
        <FaqDetailPage 
          faqId={activeFaqId} 
          faqs={appData.faqs} 
          onBack={() => setActiveFaqId(null)} 
          onOpenIntake={() => handleOpenIntake()} 
          onOpenBookCall={() => setIsBookCallOpen(true)} 
        />
      ) : (
        <motion.main
          variants={pageFadeIn}
          initial="hidden"
          animate="visible"
        >
        {/* Hero Section */}
        <section 
          className="relative min-h-[95vh] pt-32 pb-20 overflow-hidden flex items-center bg-[#0B1020] border-b border-indigo-900/40"
        >
          {/* Hero Background Media: Looping Video or Ken Burns Photo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {appData.about.heroVideoUrl ? (
              <video
                key={appData.about.heroVideoUrl}
                src={appData.about.heroVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80"
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

        {/* Ambient Glow Flourishes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
          <div className="absolute top-[-10%] right-[-5%] w-[750px] h-[750px] bg-blue-500/15 rounded-full blur-[130px] animate-float-slow" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[650px] h-[650px] bg-indigo-500/15 rounded-full blur-[120px] animate-float-reverse" />
          <div className="absolute top-[30%] left-[20%] w-[450px] h-[450px] bg-sky-400/10 rounded-full blur-[140px] animate-pulse-glow" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl lg:max-w-4xl"
          >
              <motion.div 
                variants={fadeInReveal}
                whileHover={{ scale: 1.03 }}
                whileTap={tapScale}
                className="inline-flex items-center gap-2.5 rounded-full bg-black/40 border border-white/20 px-4 py-2 text-sm font-bold text-blue-300 mb-8 shadow-lg backdrop-blur-md cursor-default"
              >
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-white font-bold">Available for Q4 2026 Sprints</span>
                <span className="text-amber-400 font-black text-xs">★</span>
              </motion.div>
              <motion.h1 
                variants={fadeInReveal}
                className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] uppercase mb-4 font-display drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
              >
                I Build <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">Apps</span> <br />
                That Scale.
              </motion.h1>
              <motion.p 
                variants={fadeInReveal}
                className="mt-8 text-xl sm:text-2xl font-bold text-white max-w-xl leading-relaxed mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              >
                Full-stack engineering for founders. From zero to App Store in weeks, not months. High-performance, pixel-perfect, and business-ready.
              </motion.p>
              
                <motion.div 
                  variants={fadeInReveal}
                  className="mt-10 flex flex-wrap gap-4"
                >
                  <motion.button
                    whileHover={{ 
                      scale: 1.03, 
                      y: -2,
                      boxShadow: '0 16px 32px -8px rgba(37, 99, 235, 0.6)'
                    }}
                    whileTap={tapScale}
                    transition={springTransition}
                    onClick={() => handleOpenIntake()}
                    className="rounded-2xl bg-blue-600 hover:bg-blue-500 px-8 py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 transition-all cursor-pointer border border-blue-400/40"
                  >
                    Start Your Project
                  </motion.button>
                  <motion.a 
                    href="#portfolio"
                    whileHover={{ scale: 1.025, y: -2 }}
                    whileTap={tapScale}
                    transition={springTransition}
                    className="rounded-2xl border-2 border-white/80 bg-white/15 backdrop-blur-md px-8 py-5 text-sm font-black uppercase tracking-widest text-white hover:bg-white hover:text-slate-950 hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 transition-all shadow-xl cursor-pointer"
                  >
                    View My Work
                  </motion.a>
                </motion.div>

                <motion.div 
                  variants={fadeInReveal}
                  className="mt-12 flex items-center gap-6 pt-12 border-t border-white/20"
                >
                  <motion.div whileHover={{ y: -2 }} transition={springTransition}>
                    <p className="text-3xl font-black text-white drop-shadow-md">{appData.about.yearsExperience}+</p>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Active Clients</p>
                  </motion.div>
                  <div className="h-8 w-px bg-white/20" />
                  <motion.div whileHover={{ y: -2 }} transition={springTransition}>
                    <p className="text-3xl font-black text-white drop-shadow-md">{appData.about.appsBuilt}+</p>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Apps Launched</p>
                  </motion.div>
                  <div className="h-8 w-px bg-white/20" />
                  <motion.div whileHover={{ y: -2 }} transition={springTransition}>
                    <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent drop-shadow-md">100%</p>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Client Success</p>
                  </motion.div>
                </motion.div>
              </motion.div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 bg-white relative overflow-hidden">
        {/* Subtle Section Ambient Wash */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInReveal}
            className="mb-20"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-blue-600 mb-4 border border-blue-100/60">
              Selected Work
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl uppercase">
              Proven <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Results.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg font-medium text-slate-500">
              A selection of high-performance mobile and web applications built from scratch.
            </p>
          </motion.div>

            {isLoading ? (
              <div className="grid gap-8 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
                className="grid gap-8 md:grid-cols-2"
              >
                {appData.portfolio.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={fadeInReveal}
                    whileHover={liquidHover}
                    whileTap={tapScale}
                    className="group relative flex flex-col overflow-hidden rounded-[32px] bg-slate-50/80 border border-slate-200/70 transition-all hover:border-blue-300 shadow-xs"
                  >
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.map(tech => (
                          <span key={tech} className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-2xs border border-blue-100/60">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{project.title}</h3>
                      <p className="text-slate-500 font-medium line-clamp-2 mb-6 flex-1">{project.description}</p>
                      <motion.button 
                        whileHover={{ x: 5 }}
                        whileTap={tapScale}
                        onClick={() => handleOpenIntake({
                          appName: project.title,
                          description: `I would like to request a project with architecture/features inspired by ${project.title}: ${project.description}`,
                          projectType: 'app'
                        })}
                        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-8 rounded-lg px-2 -mx-2 cursor-pointer"
                      >
                        <span>Start Project Similar to This</span>
                        <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        <WebsitesSection items={appData.portfolio} onOpenIntake={handleOpenIntake} />
        
        {isLoading ? (
          <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <Skeleton className="aspect-video w-full" />
                <div className="space-y-6">
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <MyApps apps={appData.myApps || []} />
        )}

        {isLoading ? (
          <section className="py-32 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 md:grid-cols-3">
                {[1, 2, 3].map(i => <PricingSkeleton key={i} />)}
              </div>
            </div>
          </section>
        ) : (
          <Pricing 
            items={appData.pricingTiers} 
            onSelectTier={(tierName) => handleOpenIntake({ 
              tier: tierName, 
              projectType: tierName.toLowerCase().includes('web') ? 'website' : 'app' 
            })} 
          />
        )}

      {/* Testimonials */}
      <section className="py-32 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInReveal}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl uppercase">
              What founders <span className="text-blue-400">say.</span>
            </h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3"
          >
            {appData.testimonials.map((test) => (
              <motion.div
                key={test.id}
                variants={fadeInReveal}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative rounded-[32px] bg-white/5 border border-white/10 p-8 backdrop-blur-sm"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-blue-400 text-blue-400" />
                  ))}
                </div>
                <p className="text-lg font-medium text-slate-300 italic mb-8 leading-relaxed">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                  <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-black">
                    {test.clientName[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase tracking-tight">{test.clientName}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{test.role}, {test.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Direct Contact & Feedback Section */}
      <Contact />

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInReveal}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl uppercase">
              The <span className="text-blue-600">Process.</span>
            </h2>
            <p className="mt-6 text-lg font-medium text-slate-500">
              Answers to common questions about starting a project.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {appData.faqs.map((faq) => (
              <motion.div
                key={faq.id}
                variants={fadeInReveal}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden"
              >
                <div className="flex w-full items-center justify-between p-6 text-left group">
                  <span className="text-lg font-black text-slate-900 tracking-tight">{faq.question}</span>
                  <button 
                    onClick={() => setActiveFaqId(faq.id)}
                    className="rounded-full bg-white p-2 text-blue-600 shadow-sm border border-slate-50 transition-transform hover:scale-110 cursor-pointer"
                    title="View Full Detailed Guide"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
                <div className="px-6 pb-6 text-slate-500 font-medium leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      </motion.main>
      )}

      <Footer 
        onOpenProducerPortal={() => setIsProducerPortalOpen(true)} 
        isProducerUnlocked={isProducerUnlocked} 
      />

      <FloatingBookCall onClick={() => setIsBookCallOpen(true)} />

      {/* Global Project Request / Intake Modal */}
      <IntakeForm
        isModal={true}
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        initialTier={intakeInitialData?.tier}
        initialAppName={intakeInitialData?.appName}
        initialDescription={intakeInitialData?.description}
        initialProjectType={intakeInitialData?.projectType}
        pricingTiers={appData.pricingTiers}
      />
      
      <AnimatePresence>
        {isProducerPortalOpen && (
          <ProducerPortal 
            isOpen={isProducerPortalOpen} 
            onClose={() => setIsProducerPortalOpen(false)} 
            isUnlocked={isProducerUnlocked}
            onUnlockSuccess={() => setIsProducerUnlocked(true)}
            onDataUpdated={fetchPublicData}
          />
        )}
      </AnimatePresence>

      <AuthScreen 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      <BookCallModal 
        isOpen={isBookCallOpen} 
        onClose={() => setIsBookCallOpen(false)} 
        whatsappNumber={appData.whatsappNumber || '2349070392028'}
        businessEmail={appData.businessEmail || 'deemakers01@gmail.com'}
      />
    </div>
  );
}
