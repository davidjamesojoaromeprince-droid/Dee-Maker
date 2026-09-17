import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageSquare, 
  Mail, 
  Sparkles, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  PhoneCall, 
  Layers, 
  Smartphone, 
  Globe,
  X
} from 'lucide-react';
import { ProjectRequest, PricingTier, RequestStatus, PaymentStatus } from '../types';
import { auth, db } from '../lib/firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { springTransition, tapScale } from '../lib/motionPresets';

interface IntakeFormProps {
  isOpen?: boolean;
  isModal?: boolean;
  onClose?: () => void;
  selectedTier?: string;
  initialTier?: string;
  initialAppName?: string;
  initialDescription?: string;
  initialProjectType?: 'app' | 'website';
  pricingTiers?: PricingTier[];
  onRequestSubmitted?: (request: ProjectRequest) => void;
  onBookCallClick?: () => void;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({
  isOpen = true,
  isModal = false,
  onClose,
  selectedTier,
  initialTier,
  initialAppName,
  initialDescription,
  initialProjectType,
  pricingTiers = [],
  onRequestSubmitted,
  onBookCallClick
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [appName, setAppName] = useState(initialAppName || '');
  const [appDescription, setAppDescription] = useState(initialDescription || '');
  const [projectType, setProjectType] = useState<'app' | 'website'>(initialProjectType || 'app');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'email'>('whatsapp');

  const filteredTiers = (pricingTiers || []).filter(
    (tier) => tier.category === projectType
  );

  const [selectedPackage, setSelectedPackage] = useState(() => {
    if (initialTier || selectedTier) return initialTier || selectedTier || '';
    const initialFiltered = (pricingTiers || []).filter(
      (tier) => tier.category === (initialProjectType || 'app')
    );
    return initialFiltered.length > 0 ? initialFiltered[0].name : 'Custom / Not Sure Yet';
  });
  const [heardFrom, setHeardFrom] = useState('Google Search');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationData, setConfirmationData] = useState<{
    confirmationMessage: string;
    request: ProjectRequest;
  } | null>(null);

  const handleProjectTypeChange = (newType: 'app' | 'website') => {
    setProjectType(newType);
    const newFiltered = (pricingTiers || []).filter((tier) => tier.category === newType);
    if (newFiltered.length > 0) {
      setSelectedPackage(newFiltered[0].name);
    } else {
      setSelectedPackage('Custom / Not Sure Yet');
    }
  };

  useEffect(() => {
    const activeType = initialProjectType || projectType;
    if (initialProjectType) {
      setProjectType(initialProjectType);
    }

    const currentFiltered = (pricingTiers || []).filter(
      (tier) => tier.category === activeType
    );

    if (initialTier || selectedTier) {
      setSelectedPackage(initialTier || selectedTier || '');
    } else {
      const exists = currentFiltered.some((t) => t.name === selectedPackage);
      if (!exists) {
        if (currentFiltered.length > 0) {
          setSelectedPackage(currentFiltered[0].name);
        } else {
          setSelectedPackage('Custom / Not Sure Yet');
        }
      }
    }

    if (initialAppName !== undefined) {
      setAppName(initialAppName);
    }
    if (initialDescription !== undefined) {
      setAppDescription(initialDescription);
    }
  }, [initialTier, selectedTier, initialAppName, initialDescription, initialProjectType, pricingTiers, isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isModal || !isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !appName.trim() || !appDescription.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Email, App Name, and Description).');
      return;
    }

    if (preferredContact === 'whatsapp' && !phone.trim()) {
      setErrorMessage('Please provide a phone number for WhatsApp follow-up.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Save to Firestore first for reliability
      const requestData = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        appName: appName.trim(),
        appDescription: appDescription.trim(),
        projectType,
        preferredContact,
        selectedPackage,
        heardFrom,
        status: 'New' as RequestStatus,
        paymentStatus: 'Unpaid' as PaymentStatus,
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      };

      try {
        await addDoc(collection(db, 'requests'), requestData);
      } catch (fsErr) {
        console.error('Firestore save failed:', fsErr);
        // We continue anyway and try the API
      }

      // 2. Call API for AI confirmation and email notification
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          appName: appName.trim(),
          appDescription: appDescription.trim(),
          projectType,
          preferredContact,
          selectedPackage,
          heardFrom
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request.');
      }

      setConfirmationData({
        confirmationMessage: data.confirmationMessage,
        request: data.request,
      });

      if (onRequestSubmitted) {
        onRequestSubmitted(data.request);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Something went wrong while submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAppName('');
    setAppDescription('');
    setConfirmationData(null);
    setErrorMessage('');
  };

  if (isModal && !isOpen) return null;

  const content = (
    <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-200/80 p-6 sm:p-10 relative max-h-[90vh] overflow-y-auto">
      {/* Modal Close Button */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X size={20} />
        </button>
      )}

      {/* Form Header */}
      <div className="text-center mb-8 pr-6 sm:pr-0">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 border border-blue-200 px-3.5 py-1 rounded-full mb-3">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Direct Response Within 24 Hours</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          {t.intakeHeader}
        </h2>
        <p className="text-slate-600 mt-2 max-w-lg mx-auto text-xs sm:text-sm font-medium">
          {t.intakeSubheader}
        </p>
      </div>

      {confirmationData ? (
        /* On-screen AI Confirmation Message Display */
        <div className="py-4 text-left">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xs">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 w-fit mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Instant Confirmation from Dee-Maker</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">
            {t.intakeSuccessTitle}
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Project: <span className="text-slate-800">{confirmationData.request.appName}</span>
          </p>

          <div className="bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-100 rounded-2xl p-6 mb-6 text-slate-800 text-base leading-relaxed whitespace-pre-line shadow-xs">
            "{confirmationData.confirmationMessage}"
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200/60 mb-8">
            <div>
              <span className="text-slate-400 uppercase tracking-widest font-bold block mb-1">Client Name:</span>
              <span className="font-bold text-slate-800 text-sm">{confirmationData.request.name}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-widest font-bold block mb-1">Package Tier:</span>
              <span className="font-bold text-slate-800 text-sm">{confirmationData.request.selectedPackage || 'Custom Build'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-widest font-bold block mb-1">Follow-up Channel:</span>
              <span className="font-bold text-slate-800 text-sm capitalize">
                {confirmationData.request.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Email'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-widest font-bold block mb-1">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 uppercase tracking-wider">
                {confirmationData.request.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResetForm}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Submit Another Request
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Done / Close
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Intake Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Project Type Toggle */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              Project Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleProjectTypeChange('app')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  projectType === 'app'
                    ? 'bg-blue-50 border-blue-600 text-blue-800 ring-2 ring-blue-600/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile App / Native</span>
              </button>

              <button
                type="button"
                onClick={() => handleProjectTypeChange('website')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  projectType === 'website'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-800 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Web Platform / Website</span>
              </button>
            </div>
          </div>

          {/* Package Tier Selection Header */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block uppercase tracking-wider">{t.intakePackage}</span>
                <span className="text-xs font-medium text-slate-500">Flexible milestone-based delivery</span>
              </div>
            </div>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-blue-200 bg-white text-xs font-black text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {filteredTiers.length > 0 ? (
                filteredTiers.map((tier) => {
                  const formattedPrice = tier.price
                    ? tier.price.startsWith('$')
                      ? tier.price
                      : `$${tier.price}`
                    : '';
                  const label = formattedPrice ? `${tier.name} (${formattedPrice})` : tier.name;
                  return (
                    <option key={tier.id || tier.name} value={tier.name}>
                      {label}
                    </option>
                  );
                })
              ) : (
                <option value="Custom / Not Sure Yet">Custom / Not Sure Yet</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label htmlFor="client-name" className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5">
                {t.intakeName} <span className="text-red-500">*</span>
              </label>
              <input
                id="client-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="client-email" className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5">
                {t.intakeEmail} <span className="text-red-500">*</span>
              </label>
              <input
                id="client-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@company.com"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Phone Number */}
            <div>
              <label htmlFor="client-phone" className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5">
                {t.intakePhone} {preferredContact === 'whatsapp' && <span className="text-red-500">*</span>}
              </label>
              <input
                id="client-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 234-5678"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
              />
            </div>

            {/* App / Project Name */}
            <div>
              <label htmlFor="app-name" className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5">
                {t.intakeAppName} <span className="text-red-500">*</span>
              </label>
              <input
                id="app-name"
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. BrightCafes Loyalty App"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Preferred Follow-up Toggle */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                {t.intakeContactPref} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredContact('whatsapp')}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    preferredContact === 'whatsapp'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredContact('email')}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    preferredContact === 'email'
                      ? 'bg-blue-50 border-blue-600 text-blue-800 ring-2 ring-blue-600/30'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* How did you hear about me? Dropdown */}
            <div>
              <label htmlFor="heard-from" className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                How Did You Find Dee-Maker?
              </label>
              <select
                id="heard-from"
                value={heardFrom}
                onChange={(e) => setHeardFrom(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium bg-white"
              >
                <option value="Google Search">Google Search</option>
                <option value="LinkedIn / Social Media">LinkedIn / Social Media</option>
                <option value="Referral / Word of Mouth">Referral / Word of Mouth</option>
                <option value="GitHub / Portfolio">GitHub / Portfolio</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* App Description */}
          <div>
            <label htmlFor="app-description" className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5">
              {t.intakeDescription} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="app-description"
              rows={4}
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Describe what your app or website should do, target users, core features (e.g. user accounts, payments, push notifications), and target launch date."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
              required
            />
          </div>

          {/* Submit Button & Response Info */}
          <div>
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={tapScale}
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-sm hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating Confirmation with Dee-Maker...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {t.intakeSubmitBtn}
                </>
              )}
            </motion.button>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Average Response: <strong className="text-slate-800">Under 2 Hours</strong></span>
              </div>

              {onBookCallClick && (
                <button
                  type="button"
                  onClick={onBookCallClick}
                  className="text-blue-600 hover:text-blue-800 font-bold underline inline-flex items-center space-x-1 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t.floatingBookCall}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );

  if (isModal) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={springTransition}
              className="relative w-full max-w-2xl z-10 my-auto"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <section id="intake-form" className="py-16 md:py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </section>
  );
};

