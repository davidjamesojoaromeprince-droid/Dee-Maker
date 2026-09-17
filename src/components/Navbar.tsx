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
        ? 'bg-white/90 py-3 shadow-[0_12px_32px_rgba(37,99,235,0.06),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl border-b border-slate-200/60' 
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
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl shadow-[0_8px_20px_-4px_rgba(37,99,235,0.45)] transition-all group-hover:shadow-[0_12px_28px_-4px_rgba(37,99,235,0.6)]">
              <DeeMakerLogo size={44} />
              <motion.div
                key={animKey}
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 pointer-events-none"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-display">
              DEE-MAKER<span className="text-blue-600">.</span>
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
                  whileHover={{ y: -2, color: '#2563eb' }}
                  whileTap={tapScale}
                  className="text-sm font-bold text-slate-600 transition-colors hover:text-blue-600 cursor-pointer"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center gap-3 border-l border-slate-200/80 pl-6">
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={tapScale}
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100/60 shadow-xs cursor-pointer"
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
                        className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/5 border border-slate-100"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 mb-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                          <p className="truncate text-sm font-bold text-slate-900">{user.email}</p>
                        </div>
                        <motion.button
                          whileHover={{ x: 4, backgroundColor: 'rgba(254, 242, 242, 1)' }}
                          whileTap={tapScale}
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors cursor-pointer"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
                  className="flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all cursor-pointer"
                >
                  <span>Start Project</span>
                  <Send size={13} />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ 
                  scale: 1.03, 
                  y: -1,
                  boxShadow: '0 14px 28px -6px rgba(37, 99, 235, 0.35), 0 4px 10px -2px rgba(245, 158, 11, 0.15)'
                }}
                whileTap={tapScale}
                transition={springTransition}
                onClick={onOpenProducerPrompt}
                className="group relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer overflow-hidden"
              >
                <span className="relative z-10">Book Call</span>
                <PhoneCall size={14} className="relative z-10 transition-transform group-hover:rotate-12" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors"
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
            className="overflow-hidden bg-white lg:hidden border-t border-slate-100 shadow-2xl"
          >
            <div className="space-y-1 px-4 pb-6 pt-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block rounded-xl px-4 py-3 text-base font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-black text-slate-900 truncate">{user.displayName || user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors cursor-pointer"
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
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
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
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-md"
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
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20"
                >
                  Book a Call
                  <PhoneCall size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

