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
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  ShieldAlert,
  FileText,
  Check
} from 'lucide-react';
import { ProjectRequest, PricingTier, RequestStatus, PaymentStatus, IntakeQuestion, QuestionnaireAnswer } from '../types';
import { db } from '../lib/firebaseClient';
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { springTransition, tapScale } from '../lib/motionPresets';
import { defaultIntakeQuestions } from '../lib/initialData';

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
  whatsappNumber?: string;
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
  whatsappNumber: initialWhatsappNumber,
  onRequestSubmitted,
  onBookCallClick
}) => {
  const { t } = useLanguage();

  // Basic contact fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [appName, setAppName] = useState(initialAppName || '');
  const [projectType, setProjectType] = useState<'app' | 'website'>(initialProjectType || 'app');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'email'>('whatsapp');
  const [heardFrom, setHeardFrom] = useState('Google Search');

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

  // Dynamic Questions from Firestore or default
  const [questions, setQuestions] = useState<IntakeQuestion[]>(defaultIntakeQuestions);
  const [businessEmail, setBusinessEmail] = useState<string>('yourbusiness@email.com');
  const [whatsappNumber, setWhatsappNumber] = useState<string>(initialWhatsappNumber || '2349070392028');

  // Answers state keyed by question.id
  const [answers, setAnswers] = useState<Record<string, any>>({
    'q-problem': initialDescription || '',
  });

  // Section collapsed states (open section 1 by default, toggle others)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Project scope': true,
    'Technical and access': true,
    'Business logic': false,
    'Practical / contract': false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationData, setConfirmationData] = useState<{
    confirmationMessage: string;
    request: ProjectRequest;
  } | null>(null);

  // Copy details & mailto / WhatsApp feedback state
  const [copiedTextToast, setCopiedTextToast] = useState(false);
  const [mailtoNotice, setMailtoNotice] = useState<string | null>(null);
  const [whatsappNotice, setWhatsappNotice] = useState<string | null>(null);

  // Load questions and business email setting
  useEffect(() => {
    const loadIntakeData = async () => {
      try {
        const qSnap = await getDocs(collection(db, 'intake_questions'));
        if (!qSnap.empty) {
          const loadedQs: IntakeQuestion[] = qSnap.docs.map(d => ({ id: d.id, ...d.data() } as IntakeQuestion));
          loadedQs.sort((a, b) => (a.order || 0) - (b.order || 0));
          setQuestions(loadedQs);
        }

        // Check siteData/main for configured WhatsApp number
        const siteDoc = await getDoc(doc(db, 'siteData', 'main'));
        if (siteDoc.exists()) {
          const sData = siteDoc.data();
          if (sData.whatsappNumber) {
            setWhatsappNumber(sData.whatsappNumber);
          }
        }

        const emailDoc = await getDoc(doc(db, 'settings', 'email'));
        if (emailDoc.exists()) {
          const eData = emailDoc.data();
          if (eData.businessEmail) {
            setBusinessEmail(eData.businessEmail);
          } else if (eData.notifyEmail) {
            setBusinessEmail(eData.notifyEmail);
          }
          if (eData.whatsappNumber && !siteDoc.exists()) {
            setWhatsappNumber(eData.whatsappNumber);
          }
        }
      } catch (err) {
        console.warn('Using default questions and business email setting:', err);
      }
    };

    loadIntakeData();
  }, []);

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
      setAnswers(prev => ({ ...prev, 'q-problem': initialDescription }));
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

  // Filter questions for current projectType
  const activeQuestions = questions.filter(
    (q) => q.appliesTo === 'both' || q.appliesTo === projectType
  );

  // Group active questions by section
  const sectionsList = ['Project scope', 'Technical and access', 'Business logic', 'Practical / contract'];
  const questionsBySection = sectionsList.reduce((acc, sec) => {
    acc[sec] = activeQuestions.filter((q) => q.section === sec);
    return acc;
  }, {} as Record<string, IntakeQuestion[]>);

  // Add any questions that belong to custom sections
  activeQuestions.forEach((q) => {
    if (!sectionsList.includes(q.section)) {
      if (!questionsBySection[q.section]) {
        questionsBySection[q.section] = [];
        sectionsList.push(q.section);
      }
      if (!questionsBySection[q.section].includes(q)) {
        questionsBySection[q.section].push(q);
      }
    }
  });

  const handleAnswerChange = (qId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleMultiSelectToggle = (qId: string, option: string) => {
    const currentList: string[] = Array.isArray(answers[qId]) ? answers[qId] : [];
    if (currentList.includes(option)) {
      setAnswers((prev) => ({
        ...prev,
        [qId]: currentList.filter((item) => item !== option),
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [qId]: [...currentList, option],
      }));
    }
  };

  const toggleSection = (sectionName: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Primary Validation: Only Name, Email, App Name, and Problem statement are strictly required
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!appName.trim()) {
      setErrorMessage('Please enter your app or website name.');
      return;
    }

    if (preferredContact === 'whatsapp' && !phone.trim()) {
      setErrorMessage('Please provide a phone number for WhatsApp follow-up.');
      return;
    }

    // Check required dynamic questions
    for (const q of activeQuestions) {
      if (q.required) {
        const val = answers[q.id];
        const isEmpty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0);
        if (isEmpty) {
          setErrorMessage(`Please answer required question: "${q.label}"`);
          // Ensure its section is expanded
          setOpenSections((prev) => ({ ...prev, [q.section]: true }));
          return;
        }
      }
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Build structured answers array
      const questionnaireAnswersList: QuestionnaireAnswer[] = activeQuestions.map((q) => {
        let rawVal = answers[q.id];
        if (rawVal === undefined || rawVal === null) rawVal = 'Not specified';
        return {
          questionId: q.id,
          label: q.label,
          section: q.section,
          answer: rawVal,
        };
      });

      const problemAnswer = answers['q-problem'] || answers['q-must-haves'] || '';
      const summaryDescription = typeof problemAnswer === 'string' && problemAnswer.trim() ? problemAnswer : 'Custom project request';

      const requestData = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        appName: appName.trim(),
        appDescription: summaryDescription,
        projectType,
        preferredContact,
        selectedPackage,
        heardFrom,
        answers,
        questionnaireAnswers: questionnaireAnswersList,
        status: 'New' as RequestStatus,
        paymentStatus: 'Unpaid' as PaymentStatus,
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      };

      try {
        await addDoc(collection(db, 'requests'), requestData);
      } catch (fsErr) {
        console.error('Firestore save failed:', fsErr);
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          appName: appName.trim(),
          appDescription: summaryDescription,
          projectType,
          preferredContact,
          selectedPackage,
          heardFrom,
          answers,
          questionnaireAnswers: questionnaireAnswersList
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request.');
      }

      setConfirmationData({
        confirmationMessage: data.confirmationMessage,
        request: {
          ...data.request,
          answers,
          questionnaireAnswers: questionnaireAnswersList
        },
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
    setAnswers({});
    setConfirmationData(null);
    setErrorMessage('');
    setMailtoNotice(null);
  };

  // Build formatted text for email / WhatsApp / clipboard
  const generateFormattedDetails = (): string => {
    if (!confirmationData) return '';
    const req = confirmationData.request;
    const category = req.projectType === 'website' ? 'Website & Cloud Portal' : 'Mobile Application';
    
    // Find matching tier price if available
    const matchingTier = pricingTiers.find(t => t.name === req.selectedPackage);
    const tierPrice = matchingTier ? `${matchingTier.price}/${matchingTier.period}` : 'Custom Scope';

    const lines: string[] = [];

    lines.push(`PROJECT INTAKE BRIEF — DEE-MAKER STUDIO`);
    lines.push(`======================================\n`);
    lines.push(`CLIENT INFORMATION:`);
    lines.push(`• Name: ${req.name}`);
    lines.push(`• Email: ${req.email}`);
    lines.push(`• Phone / WhatsApp: ${req.phone || 'Not provided'}`);
    lines.push(`• Preferred Contact Method: ${req.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Email'}\n`);

    lines.push(`PACKAGE & ESTIMATE:`);
    lines.push(`• Project Name: ${req.appName}`);
    lines.push(`• Category: ${category}`);
    lines.push(`• Selected Package: ${req.selectedPackage || 'Custom Build'}`);
    lines.push(`• Price: ${tierPrice}\n`);

    const qAns = req.questionnaireAnswers || [];
    const grouped = qAns.reduce((acc, item) => {
      if (!acc[item.section]) acc[item.section] = [];
      acc[item.section].push(item);
      return acc;
    }, {} as Record<string, QuestionnaireAnswer[]>);

    Object.keys(grouped).forEach((section) => {
      // Security: Skip any sensitive password or secret sections
      const secLower = section.toLowerCase();
      if (secLower.includes('password') || secLower.includes('secret') || secLower.includes('credential')) return;

      const validItems = grouped[section].filter((q) => {
        const labelLower = (q.label || '').toLowerCase();
        // Never output password or secret keys
        if (labelLower.includes('password') || labelLower.includes('secret') || labelLower.includes('api key') || labelLower.includes('private key') || labelLower.includes('token')) {
          return false;
        }
        const answerText = Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;
        return answerText && answerText !== 'Not specified' && String(answerText).trim() !== '';
      });

      if (validItems.length > 0) {
        lines.push(`SECTION: ${section.toUpperCase()}`);
        lines.push(`--------------------------------------`);
        validItems.forEach((q) => {
          const answerText = Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;
          lines.push(`• ${q.label}:`);
          lines.push(`  ${answerText}\n`);
        });
      }
    });

    return lines.join('\n');
  };

  // Format WhatsApp number to digits-only international format
  const getCleanWhatsAppNumber = (num?: string): string => {
    if (!num) return '2349070392028';
    let digits = num.replace(/\D/g, '');
    if (!digits) return '2349070392028';
    // If entered in Nigerian local format 09070392028 (11 digits starting with 0), replace 0 with 234
    if (digits.startsWith('0') && digits.length === 11) {
      digits = '234' + digits.slice(1);
    }
    return digits;
  };

  // Send to WhatsApp Handler
  const handleSendToWhatsApp = () => {
    if (!confirmationData) return;
    const targetPhone = getCleanWhatsAppNumber(whatsappNumber);
    const fullText = generateFormattedDetails();
    const encoded = encodeURIComponent(fullText);

    // Fallback for long messages (encoded text > ~1800 characters)
    if (encoded.length > 1800) {
      navigator.clipboard.writeText(fullText);
      setWhatsappNotice('Your project details are copied! Paste them into the WhatsApp chat and tap Send.');
      const shortMsg = encodeURIComponent('Hi, I just submitted my project details. Pasting them now.');
      window.open(`https://wa.me/${targetPhone}?text=${shortMsg}`, '_blank', 'noopener,noreferrer');
    } else {
      setWhatsappNotice(null);
      window.open(`https://wa.me/${targetPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Fast Review by Email Handler
  const handleFastReviewByEmail = () => {
    if (!confirmationData) return;
    const req = confirmationData.request;
    const targetEmail = businessEmail && businessEmail !== 'yourbusiness@email.com' ? businessEmail : 'yourbusiness@email.com';
    const subject = `New Project Request — ${req.name} — ${req.selectedPackage || 'Custom'}`;
    const fullBodyText = generateFormattedDetails();

    const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBodyText)}`;

    // Check length (mailto URL length > 1800 chars causes breakage in mail clients)
    if (mailtoUrl.length > 1800) {
      // Fallback: Copy full details to clipboard, open mailto with short message
      navigator.clipboard.writeText(fullBodyText);
      setMailtoNotice('Your full project details are copied! Paste them into your email client and tap Send.');
      
      const shortBody = `Please paste my project details here:\n\n[PASTE YOUR COPIED PROJECT DETAILS HERE]`;
      const shortMailto = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shortBody)}`;
      window.location.href = shortMailto;
    } else {
      window.location.href = mailtoUrl;
    }
  };

  const handleCopyDetails = () => {
    const text = generateFormattedDetails();
    navigator.clipboard.writeText(text);
    setCopiedTextToast(true);
    setTimeout(() => setCopiedTextToast(false), 2500);
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
        /* On-screen AI Confirmation Message Display & Fast Review */
        <div className="py-4 text-left space-y-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-xs">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 w-fit">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Instant Confirmation from Dee-Maker</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            {t.intakeSuccessTitle}
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Project: <span className="text-slate-800">{confirmationData.request.appName}</span>
          </p>

          <div className="bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-100 rounded-2xl p-6 text-slate-800 text-base leading-relaxed whitespace-pre-line shadow-xs">
            "{confirmationData.confirmationMessage}"
          </div>

          {/* WhatsApp Notice Banner */}
          {whatsappNotice && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-900 text-xs font-bold flex items-start space-x-3 shadow-md animate-in fade-in duration-200">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm text-emerald-950 mb-0.5">Details Copied to Clipboard!</p>
                <p>{whatsappNotice}</p>
              </div>
            </div>
          )}

          {/* Mailto Overflow Notice */}
          {mailtoNotice && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs font-semibold flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>{mailtoNotice}</div>
            </div>
          )}

          {/* Fast Review Section: WhatsApp + Email + Copy */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Fast Track Delivery</span>
            </div>
            <h4 className="text-lg font-bold text-white">Send Your Brief Directly to Dee-Maker</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly forward all your project answers to our team via WhatsApp or Email. We will review your answers and respond within 24 hours!
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 pt-2">
              {/* Green "Send to WhatsApp" button */}
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-emerald-500/25 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>Send to WhatsApp</span>
              </button>

              {/* Fast Review by Email button */}
              <button
                type="button"
                onClick={handleFastReviewByEmail}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-2" />
                <span>Fast Review by Email</span>
              </button>

              {/* Copy My Details button */}
              <button
                type="button"
                onClick={handleCopyDetails}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-700"
              >
                {copiedTextToast ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2 text-slate-400" />
                    <span>Copy My Details</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
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

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
        /* Intake Questionnaire Form */
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
              Project Category <span className="text-red-500">*</span>
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

          {/* Package Selection Header */}
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

          {/* Basic Client Contact Fields */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
              Contact & Project Name
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium bg-white"
                  required
                />
              </div>

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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium bg-white"
                />
              </div>

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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5">
                  {t.intakeContactPref} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredContact('whatsapp')}
                    className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      preferredContact === 'whatsapp'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredContact('email')}
                    className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      preferredContact === 'email'
                        ? 'bg-blue-50 border-blue-600 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="heard-from" className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5">
                  How Did You Find Dee-Maker?
                </label>
                <select
                  id="heard-from"
                  value={heardFrom}
                  onChange={(e) => setHeardFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium bg-white"
                >
                  <option value="Google Search">Google Search</option>
                  <option value="LinkedIn / Social Media">LinkedIn / Social Media</option>
                  <option value="Referral / Word of Mouth">Referral / Word of Mouth</option>
                  <option value="GitHub / Portfolio">GitHub / Portfolio</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* PROJECT QUESTIONNAIRE SECTIONS (COLLAPSIBLE ACCORDIONS) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest px-1">
              Project Questionnaire ({projectType === 'website' ? 'Website' : 'Mobile App'})
            </h3>

            {sectionsList.map((secName, secIdx) => {
              const secQuestions = questionsBySection[secName] || [];
              if (secQuestions.length === 0) return null;
              const isExpanded = openSections[secName] ?? (secIdx === 0);

              return (
                <div
                  key={secName}
                  className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs transition-all"
                >
                  {/* Section Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleSection(secName)}
                    className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        {secIdx + 1}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{secName}</span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {secQuestions.length} {secQuestions.length === 1 ? 'question' : 'questions'}
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-400 hover:text-slate-700">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {/* Section Content */}
                  {isExpanded && (
                    <div className="p-5 space-y-5 bg-white">
                      {/* Special Security Warning Note for Section 2 */}
                      {secName === 'Technical and access' && (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start space-x-2.5">
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-snug font-medium">
                            Please do NOT type passwords, login details, or secret API keys here. We will arrange safe access with you privately after your project is confirmed.
                          </span>
                        </div>
                      )}

                      {secQuestions.map((q) => {
                        const val = answers[q.id];

                        return (
                          <div key={q.id} className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-800">
                              {q.label} {q.required && <span className="text-red-500">*</span>}
                            </label>

                            {q.note && (
                              <p className="text-[11px] text-slate-500 font-medium mb-1">
                                {q.note}
                              </p>
                            )}

                            {/* SHORT TEXT */}
                            {q.type === 'short_text' && (
                              <input
                                type="text"
                                value={val || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                placeholder="Your answer..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium"
                              />
                            )}

                            {/* LONG TEXT */}
                            {q.type === 'long_text' && (
                              <textarea
                                rows={3}
                                value={val || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                placeholder="Provide details here..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium"
                              />
                            )}

                            {/* YES / NO */}
                            {q.type === 'yes_no' && (
                              <div className="flex space-x-3">
                                {['Yes', 'No'].map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, opt)}
                                    className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                      val === opt
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* SELECT */}
                            {q.type === 'select' && (
                              <select
                                value={val || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium bg-white"
                              >
                                <option value="">Select an option...</option>
                                {(q.options || []).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            )}

                            {/* MULTI SELECT */}
                            {q.type === 'multi_select' && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {(q.options || []).map((opt) => {
                                  const list: string[] = Array.isArray(val) ? val : [];
                                  const isSelected = list.includes(opt);

                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => handleMultiSelectToggle(q.id, opt)}
                                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {isSelected ? `✓ ${opt}` : opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
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
              className="relative w-full max-w-3xl z-10 my-auto"
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
