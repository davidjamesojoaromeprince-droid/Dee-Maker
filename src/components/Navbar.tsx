import React, { useState, useEffect } from 'react';
import { Smartphone, Menu, X, PhoneCall, User, LogOut, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebaseClient';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { springTransition, tapScale } from '../lib/motionPresets';
import { DeeMakerLogo } from './DeeMakerLogo';

interface NavbarProps {
  onOpenProducerPrompt: () => void;
  onOpenAuth: () => void;
  onOpenIntake?: () => void;
}

const NAV_LINKS = [
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'Websites', href: '#websites' },
  { name: 'My Apps', href: '#my-apps' },
  { name: 'Services', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: '#contact' }
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenProducerPrompt, onOpenAuth, onOpenIntake }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Loop logo animation smoothly with a relaxed pause between cycles
  useEffect(() => {
    const timer = setInterval(() => setAnimKey(prev => prev + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ease-out ${
      isScrolled 
        ? 'bg-[#0B1020]/85 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl border-b border-indigo-900/40' 
        : 'bg-transparent py-5'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button 
            onClick={handleLogoClick}
            whileHover={{ scale: 1.04 }}
            whileTap={tapScale}
            className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl shadow-[0_8px_20px_-4px_rgba(37,99,235,0.6)] transition-all group-hover:shadow-[0_12px_28px_-4px_rgba(124,58,237,0.8)] border border-white/20">
              <DeeMakerLogo size={44} />
              <motion.div
                key={animKey}
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 pointer-events-none"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-2xl font-black tracking-tighter font-display text-white">
              DEE-MAKER<span className="text-pink-500">.</span>
            </span>
          </motion.button>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 lg:flex">
            <div className="flex items-center gap-6 xl:gap-8">
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  whileHover={{ y: -2, color: '#38bdf8' }}
                  whileTap={tapScale}
                  className="text-sm font-bold transition-colors cursor-pointer text-slate-200 hover:text-white"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center gap-3 border-l border-white/20 pl-6 transition-colors">
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={tapScale}
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-950 text-indigo-300 hover:bg-indigo-900 transition-colors border border-indigo-700/60 shadow-xs cursor-pointer"
                  >
                    {user.email?.[0].toUpperCase() ?? <User size={20} />}
                  </motion.button>
                  
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={springTransition}
                        className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-slate-900 p-2 shadow-2xl ring-1 ring-white/10 border border-slate-800 text-white"
                      >
                        <div className="px-4 py-3 border-b border-slate-800 mb-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                          <p className="truncate text-sm font-bold text-white">{user.email}</p>
                        </div>
                        <motion.button
                          whileHover={{ x: 4, backgroundColor: 'rgba(225, 29, 72, 0.2)' }}
                          whileTap={tapScale}
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-400 transition-colors cursor-pointer"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={tapScale}
                  onClick={onOpenAuth}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
                  title="Sign In"
                >
                  <User size={18} />
                </motion.button>
              )}

              {onOpenIntake && (
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={tapScale}
                  onClick={onOpenIntake}
                  className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-md transition-all cursor-pointer bg-white hover:bg-slate-100 text-slate-950"
                >
                  <span>Start Project</span>
                  <Send size={13} />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={tapScale}
                transition={springTransition}
                onClick={onOpenProducerPrompt}
                className="glow-btn group relative flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg cursor-pointer border border-white/20 overflow-hidden"
              >
                <span className="relative z-10">Book Call</span>
                <PhoneCall size={14} className="relative z-10 transition-transform group-hover:rotate-12 text-cyan-300" />
              </motion.button>
            </div>
          </div>

          {/* Mobile Header Right & Menu Toggle */}
          <div className="flex items-center gap-2.5 lg:hidden">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100/60 shadow-xs cursor-pointer font-bold text-sm overflow-hidden"
                  title={user.email || 'User Profile'}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.email || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    user.email?.[0].toUpperCase() ?? <User size={16} />
                  )}
                </button>
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={springTransition}
                      className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/5 border border-slate-100 z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                        <p className="truncate text-sm font-bold text-slate-900">{user.displayName || user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-xl p-2 transition-colors text-white hover:bg-white/10"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#0B1020]/95 backdrop-blur-2xl lg:hidden border-t border-indigo-900/40 shadow-2xl text-white"
          >
            <div className="space-y-1 px-4 pb-6 pt-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block rounded-xl px-4 py-3 text-base font-bold text-slate-200 hover:bg-white/10 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <div className="rounded-2xl border border-white/15 p-4 bg-white/5 backdrop-blur-md space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-black text-white truncate">{user.displayName || user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 px-4 py-2.5 text-sm font-bold text-rose-300 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20"
                  >
                    <User size={18} />
                    Sign In
                  </button>
                )}
                {onOpenIntake && (
                  <button
                    onClick={() => {
                      onOpenIntake();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 px-4 py-3.5 text-sm font-black uppercase tracking-widest shadow-md hover:bg-slate-100"
                  >
                    Start Project
                    <Send size={16} />
                  </button>
                )}
                <button
                  onClick={() => {
                    onOpenProducerPrompt();
                    setIsOpen(false);
                  }}
                  className="glow-btn flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg border border-white/20"
                >
                  Book a Call
                  <PhoneCall size={18} className="text-cyan-300" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

