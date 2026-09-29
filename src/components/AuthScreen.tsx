import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebaseClient';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { X, Mail, Lock, LogIn, UserPlus, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { springTransition, tapScale } from '../lib/motionPresets';

interface AuthScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setSuccess(false);
      setIsForgotPassword(false);
      setResetSent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending password reset email');
    } finally {
      setLoading(false);
    }
  };

  // Render form contents for a specific mode
  const renderFormContent = (modeSignUp: boolean) => {
    // If we're on the Sign In tab and user clicked "Forgot Password?"
    if (!modeSignUp && isForgotPassword) {
      if (resetSent) {
        return (
          <div className="w-full max-w-sm mx-auto space-y-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-md border border-blue-100"
            >
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check Your Inbox</h2>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">
                We've sent a password reset link to <span className="font-bold text-slate-800">{email}</span>.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetSent(false);
                  setError(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Reset Password
            </h2>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group transition-transform duration-200 focus-within:-translate-y-0.5">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 group-focus-within:scale-110 transition-all duration-200 pointer-events-none" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 pl-12 text-slate-900 text-sm transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/15 focus:shadow-md hover:border-slate-300"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3.5 font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <div className="flex items-center gap-2 uppercase tracking-widest text-xs font-black">
                  <KeyRound size={16} />
                  <span>Send Reset Link</span>
                </div>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setResetSent(false);
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/30 rounded px-1"
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {modeSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-slate-500 text-sm">
            {modeSignUp 
              ? 'Build your dream project with Dee-Maker' 
              : 'Sign in to manage your project requests'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group transition-transform duration-200 focus-within:-translate-y-0.5">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 group-focus-within:scale-110 transition-all duration-200 pointer-events-none" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 pl-12 text-slate-900 text-sm transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/15 focus:shadow-md hover:border-slate-300"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group transition-transform duration-200 focus-within:-translate-y-0.5">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 group-focus-within:scale-110 transition-all duration-200 pointer-events-none" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 pl-12 text-slate-900 text-sm transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/15 focus:shadow-md hover:border-slate-300"
                placeholder="••••••••"
              />
            </div>
            {!modeSignUp && (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsForgotPassword(true);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3.5 font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <div className="flex items-center gap-2 uppercase tracking-widest text-xs font-black">
                {modeSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
                {modeSignUp ? 'Create Account' : 'Sign In'}
              </div>
            )}
          </button>
        </form>

        {/* Clear High-Contrast Blue Toggle Link */}
        <div className="text-center pt-2">
          <span className="text-xs sm:text-sm text-slate-500 font-medium">
            {modeSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsForgotPassword(false);
              setResetSent(false);
              setIsSignUp(!modeSignUp);
            }}
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/30 rounded px-1"
          >
            {modeSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Darkened backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Main Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[860px] min-h-[560px] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 isolate"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 z-[60] flex items-center justify-center w-10 h-10 rounded-full bg-slate-900/80 text-white shadow-xl border border-white/20 hover:bg-slate-900 hover:text-cyan-400 transition-all cursor-pointer backdrop-blur-md"
            >
              <X size={20} className="stroke-[2.5]" />
            </motion.button>

            {/* Success State Overlay */}
            <AnimatePresence>
              {success && (
                <motion.div
                  key="success-overlay"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={springTransition}
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="mb-6 rounded-full bg-blue-50 p-5 text-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.2)] border border-blue-100"
                  >
                    <CheckCircle2 size={52} className="stroke-[2.5]" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-black text-slate-900 tracking-tight"
                  >
                    {isSignUp ? 'Verify Your Email' : 'Welcome Back!'}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-slate-500 max-w-[280px] text-sm"
                  >
                    {isSignUp 
                      ? "Check your inbox for a confirmation link to get started with Dee-Maker." 
                      : "You have been signed in successfully."}
                  </motion.p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 140 }}
                    transition={{ duration: 1.8, ease: "easeInOut", delay: 0.2 }}
                    className="h-1 bg-blue-600 rounded-full mt-6"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile View (< md) */}
            <div className="block md:hidden p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? 'mobile-signup' : 'mobile-signin'}
                  initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderFormContent(isSignUp)}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop Dual-Panel View (>= md) */}
            <div className="hidden md:flex min-h-[560px] w-full relative">
              {/* Left Column: Sign In Form */}
              <div 
                className={`w-1/2 p-10 flex flex-col justify-center transition-opacity duration-300 ${
                  !isSignUp ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none select-none'
                }`}
                aria-hidden={isSignUp}
              >
                {renderFormContent(false)}
              </div>

              {/* Right Column: Create Account Form */}
              <div 
                className={`w-1/2 p-10 flex flex-col justify-center transition-opacity duration-300 ${
                  isSignUp ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none select-none'
                }`}
                aria-hidden={!isSignUp}
              >
                {renderFormContent(true)}
              </div>

              {/* Sliding Solid Decorative Overlay Panel */}
              <motion.div
                animate={{
                  x: isSignUp ? '0%' : '100%',
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-0 left-0 h-full w-1/2 z-20 overflow-hidden shadow-xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(10, 20, 80, 0.85) 0%, rgba(124, 58, 237, 0.75) 100%), url('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Ambient Glow Orbs */}
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-blue-300/30 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />

                {/* Decorative Overlay Content */}
                <div className="relative flex h-full flex-col items-center justify-center p-10 text-center text-white z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isSignUp ? 'overlay-to-signin' : 'overlay-to-signup'}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 max-w-[280px]"
                    >
                      <h2 className="text-3xl font-black uppercase tracking-tight leading-none text-white">
                        {isSignUp ? "Welcome Back!" : "Hello, Friend!"}
                      </h2>
                      <div className="h-1 w-12 bg-white/80 mx-auto rounded-full" />
                      <p className="text-sm font-medium text-blue-50 leading-relaxed">
                        {isSignUp 
                          ? "To stay connected with your active projects, please sign in with your credentials." 
                          : "Enter your project details and start your journey with Dee-Maker today."}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: '#2563eb' }}
                        whileTap={tapScale}
                        onClick={() => {
                          setError(null);
                          setIsSignUp(!isSignUp);
                        }}
                        className="mt-6 inline-block rounded-full border-2 border-white bg-white/10 px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer shadow-lg hover:bg-white hover:text-blue-600"
                      >
                        {isSignUp ? "Sign In" : "Create Account"}
                      </motion.button>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
