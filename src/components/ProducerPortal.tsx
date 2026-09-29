import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Save,
  Mail,
  MessageSquare,
  FileText,
  Briefcase,
  HelpCircle,
  MessageCircle,
  Bell,
  X,
  ChevronRight,
  AlertCircle,
  Download,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  Compass,
  Upload,
  Video,
  Image as ImageIcon,
  Loader2,
  Link,
  Package,
  FileArchive,
  Smartphone,
  Globe,
  Copy,
  ExternalLink,
  Sparkles,
  ListOrdered,
  PhoneCall
} from 'lucide-react';
import { db } from '../lib/firebaseClient';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  FullProducerData,
  ProjectRequest,
  RequestStatus,
  PaymentStatus,
  PortfolioItem,
  Testimonial,
  FAQItem,
  AboutData,
  PrivateFeedback,
  IntakeQuestion,
  QuestionnaireAnswer,
  PricingTier,
  CallBooking,
  BookingStatus
} from '../types';
import { uploadToCloudinaryDirect } from '../lib/cloudinaryUpload';
import { defaultIntakeQuestions } from '../lib/initialData';

interface ProducerPortalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  onDataUpdated?: () => void;
}

export const ProducerPortal: React.FC<ProducerPortalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  onUnlockSuccess,
  onDataUpdated,
}) => {
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [claudeToast, setClaudeToast] = useState<string | null>(null);

  const triggerSavedNotification = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
    if (onDataUpdated) {
      onDataUpdated();
    }
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState<'requests' | 'bookings' | 'questions' | 'portfolio' | 'my-apps' | 'pricing' | 'about' | 'testimonials' | 'faqs' | 'feedback' | 'email'>('requests');

  const [producerData, setProducerData] = useState<FullProducerData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Search & Filter state for Requests
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Search & Filter state for Call Bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('All');

  // Selected Request detail view
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  // Portfolio Item Form State
  const [portfolioModal, setPortfolioModal] = useState<{
    isOpen: boolean;
    item: Partial<PortfolioItem> | null;
  }>({ isOpen: false, item: null });

  // Intake Question Form State
  const [questionModal, setQuestionModal] = useState<{
    isOpen: boolean;
    item: Partial<IntakeQuestion> | null;
  }>({ isOpen: false, item: null });

  // File Upload states for Portfolio Form
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingAppFile, setIsUploadingAppFile] = useState(false);
  const [isUploadingMyAppImage, setIsUploadingMyAppImage] = useState(false);
  const [isUploadingHeroVideo, setIsUploadingHeroVideo] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [heroVideoUploadError, setHeroVideoUploadError] = useState<string | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [appFileUploadError, setAppFileUploadError] = useState<string | null>(null);
  const [showManualImageUrl, setShowManualImageUrl] = useState(false);
  const [showManualVideoUrl, setShowManualVideoUrl] = useState(false);
  const [showManualAppUrl, setShowManualAppUrl] = useState(false);

  // Hero Background Video State
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>('');
  const [manualHeroVideoUrl, setManualHeroVideoUrl] = useState<string>('');

  // Email Settings & Business Email & WhatsApp
  const [notifyEmail, setNotifyEmail] = useState('');
  const [businessEmail, setBusinessEmail] = useState('yourbusiness@email.com');
  const [whatsappNumber, setWhatsappNumber] = useState('2349070392028');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [staleAlertDays, setStaleAlertDays] = useState(3);

  // Testimonial Form State
  const [testimonialModal, setTestimonialModal] = useState<{
    isOpen: boolean;
    item: Partial<Testimonial> | null;
  }>({ isOpen: false, item: null });

  // FAQ Form State
  const [faqModal, setFaqModal] = useState<{
    isOpen: boolean;
    item: Partial<FAQItem> | null;
  }>({ isOpen: false, item: null });

  // My Apps Form State
  const [myAppModal, setMyAppModal] = useState<{
    isOpen: boolean;
    item: any | null;
  }>({ isOpen: false, item: null });

  // Pricing Form State
  const [pricingModal, setPricingModal] = useState<{
    isOpen: boolean;
    item: any | null;
  }>({ isOpen: false, item: null });

  // About Story Form State
  const [aboutForm, setAboutForm] = useState<AboutData>({
    title: '',
    story: '',
    yearsExperience: 6,
    appsBuilt: 24,
    skills: []
  });
  const [skillsInput, setSkillsInput] = useState('');

  // Fetch full data when unlocked
  const fetchProducerData = async () => {
    setIsLoadingData(true);
    try {
      const aboutDoc = await getDoc(doc(db, 'about', 'main'));
      const portfolioSnap = await getDocs(query(collection(db, 'portfolio'), orderBy('createdAt', 'desc')));
      const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
      const faqsSnap = await getDocs(collection(db, 'faqs'));
      const pricingSnap = await getDocs(collection(db, 'pricing_tiers'));
      const myAppsSnap = await getDocs(collection(db, 'my_apps'));
      const requestsSnap = await getDocs(query(collection(db, 'requests'), orderBy('createdAt', 'desc')));
      const bookingsSnap = await getDocs(query(collection(db, 'call_bookings'), orderBy('createdAt', 'desc'))).catch(() => null);
      const feedbackSnap = await getDocs(query(collection(db, 'feedback'), orderBy('createdAt', 'desc')));
      const settingsDoc = await getDoc(doc(db, 'settings', 'email'));
      
      // Fetch Intake Questions from Firestore
      const questionsSnap = await getDocs(collection(db, 'intake_questions'));
      let questionsList: IntakeQuestion[] = questionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as IntakeQuestion));

      // Seed default intake questions if none exist
      if (questionsList.length === 0) {
        for (const q of defaultIntakeQuestions) {
          try {
            await setDoc(doc(db, 'intake_questions', q.id), q);
          } catch (_) {}
        }
        questionsList = [...defaultIntakeQuestions];
      }

      questionsList.sort((a, b) => (a.order || 0) - (b.order || 0));

      const data: FullProducerData = {
        about: aboutDoc.exists() ? aboutDoc.data() as any : null,
        portfolio: portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        testimonials: testimonialsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        faqs: faqsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        pricingTiers: pricingSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        myApps: myAppsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        requests: requestsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        bookings: bookingsSnap && !bookingsSnap.empty
          ? (bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[])
          : [],
        privateFeedback: feedbackSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        intakeQuestions: questionsList,
        emailSettings: settingsDoc.exists() ? settingsDoc.data() as any : { notifyEmail: '', businessEmail: 'yourbusiness@email.com', enabled: true, logs: [] }
      };

      setProducerData(data);
      if (data.about) {
        setAboutForm(data.about);
        setSkillsInput((data.about.skills || []).join(', '));
      }
      if (data.emailSettings) {
        setNotifyEmail(data.emailSettings.notifyEmail || 'deemakers01@gmail.com');
        setBusinessEmail(data.emailSettings.businessEmail || 'yourbusiness@email.com');
        if (data.emailSettings.whatsappNumber) {
          setWhatsappNumber(data.emailSettings.whatsappNumber);
        }
        setNotifyEnabled(data.emailSettings.enabled ?? true);
        if (data.emailSettings.staleAlertDays) {
          setStaleAlertDays(data.emailSettings.staleAlertDays);
        }
      }

      // Fetch siteData/main for heroVideoUrl and whatsappNumber
      try {
        const siteDoc = await getDoc(doc(db, 'siteData', 'main'));
        if (siteDoc.exists()) {
          const sData = siteDoc.data();
          if (sData.heroVideoUrl !== undefined) {
            setHeroVideoUrl(sData.heroVideoUrl || '');
            setManualHeroVideoUrl(sData.heroVideoUrl || '');
          }
          if (sData.whatsappNumber) {
            setWhatsappNumber(sData.whatsappNumber);
          }
        }
      } catch (siteErr) {
        console.warn('Could not read siteData/main in Producer Portal:', siteErr);
      }
    } catch (err) {
      console.error('Error fetching producer data from Firestore:', err);
      try {
        const res = await fetch('/api/producer/full-data');
        if (res.ok) {
          const data = await res.json();
          setProducerData(data);
        }
      } catch (_) {}
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isUnlocked && isOpen) {
      fetchProducerData();
    }
  }, [isUnlocked, isOpen]);

  // Handle passcode verification
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    setIsVerifying(true);

    try {
      const res = await fetch('/api/producer/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasscode('');
        onUnlockSuccess();
        fetchProducerData();
      } else {
        setPasscodeError('Incorrect passcode. Please try again.');
      }
    } catch (err) {
      setPasscodeError('Error verifying passcode.');
    } finally {
      setIsVerifying(false);
    }
  };

  // --- ACTIONS ---

  // 1. Update Request Status
  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), { status: newStatus });
      fetchProducerData();
      triggerSavedNotification();
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status in Firestore:', err);
    }
  };

  // Update Payment Status
  const handlePaymentStatusChange = async (requestId: string, newPaymentStatus: PaymentStatus) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), { paymentStatus: newPaymentStatus });
      fetchProducerData();
      triggerSavedNotification();
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({ ...selectedRequest, paymentStatus: newPaymentStatus });
      }
    } catch (err) {
      console.error('Failed to update payment status in Firestore:', err);
    }
  };

  // CSV Export of Requests
  const handleExportCSV = () => {
    if (!producerData?.requests || producerData.requests.length === 0) {
      alert('No requests available to export.');
      return;
    }
    const headers = ['ID', 'Date', 'App Name', 'Client Name', 'Email', 'Phone', 'Package', 'Preferred Contact', 'Heard From', 'Status', 'Payment Status', 'Description', 'Notes'];
    const rows = producerData.requests.map((r) => [
      `"${r.id}"`,
      `"${new Date(r.createdAt).toLocaleDateString()}"`,
      `"${(r.appName || '').replace(/"/g, '""')}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.selectedPackage || 'Custom Build').replace(/"/g, '""')}"`,
      `"${(r.preferredContact || '').replace(/"/g, '""')}"`,
      `"${(r.heardFrom || 'Unspecified').replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.paymentStatus || 'Unpaid'}"`,
      `"${(r.appDescription || '').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dee_maker_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update Request Notes
  const handleSaveRequestNotes = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), { notes: editingNotes });
      fetchProducerData();
      triggerSavedNotification();
      if (selectedRequest) {
        setSelectedRequest({ ...selectedRequest, notes: editingNotes });
      }
    } catch (err) {
      console.error('Failed to save notes to Firestore:', err);
    }
  };

  // Delete Request
  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await deleteDoc(doc(db, 'requests', requestId));
      if (selectedRequest?.id === requestId) setSelectedRequest(null);
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Delete request from Firestore failed:', err);
    }
  };

  // 1b. Update Call Booking Status
  const handleBookingStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      // 1. Try Firestore direct update
      try {
        await updateDoc(doc(db, 'call_bookings', bookingId), { status: newStatus });
      } catch (fsErr) {
        console.warn('Firestore direct booking status update skipped:', fsErr);
      }

      // 2. Call server endpoint
      await fetch(`/api/producer/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      // 3. Update local state
      if (producerData && producerData.bookings) {
        setProducerData({
          ...producerData,
          bookings: producerData.bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
        });
      }

      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  // Delete Call Booking
  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this call booking?')) return;
    try {
      // 1. Try Firestore direct delete
      try {
        await deleteDoc(doc(db, 'call_bookings', bookingId));
      } catch (fsErr) {
        console.warn('Firestore direct booking delete skipped:', fsErr);
      }

      // 2. Call server endpoint
      await fetch(`/api/producer/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      // 3. Update local state
      if (producerData && producerData.bookings) {
        setProducerData({
          ...producerData,
          bookings: producerData.bookings.filter(b => b.id !== bookingId)
        });
      }

      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };


  // BUILD CLAUDE BRIEF & EXPORT
  const buildClaudeBrief = (request: ProjectRequest, pricingTiers: PricingTier[] = []): string => {
    const matchingTier = pricingTiers.find(t => t.name === request.selectedPackage);
    const tierPrice = matchingTier ? matchingTier.price : 'Custom';
    const category = request.projectType || 'app';

    const lines: string[] = [];

    lines.push(`You are a senior full-stack developer. Below is a complete client brief. Read it carefully, ask me any clarifying questions you still need, propose a short build plan (tech stack, pages/screens, data model), then start building step by step.\n`);

    lines.push(`# Client`);
    lines.push(`Name: ${request.name}`);
    lines.push(`Email: ${request.email}`);
    lines.push(`Phone: ${request.phone || 'N/A'}`);
    lines.push(`Preferred contact method: ${request.preferredContact}\n`);

    lines.push(`# Package chosen`);
    lines.push(`Category: ${category === 'website' ? 'Website' : 'App'}`);
    lines.push(`Tier: ${request.selectedPackage || 'Custom Build'}`);
    lines.push(`Price: ${tierPrice}\n`);

    const qAns = request.questionnaireAnswers || [];
    if (qAns.length > 0) {
      const grouped = qAns.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
      }, {} as Record<string, QuestionnaireAnswer[]>);

      Object.keys(grouped).forEach((sec) => {
        const validItems = grouped[sec].filter(q => {
          const val = Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;
          return val && val !== 'Not specified' && String(val).trim() !== '';
        });

        if (validItems.length > 0) {
          lines.push(`# ${sec}`);
          validItems.forEach((q) => {
            const valStr = Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;
            lines.push(`### ${q.label}`);
            lines.push(`${valStr}\n`);
          });
        }
      });
    } else if (request.appDescription) {
      lines.push(`# Project scope`);
      lines.push(`### What problem is your app/website solving?`);
      lines.push(`${request.appDescription}\n`);
    }

    lines.push(`# Notes`);
    lines.push(`${request.notes || 'None'}`);

    return lines.join('\n');
  };

  const handleSendToClaude = (request: ProjectRequest) => {
    const briefText = buildClaudeBrief(request, producerData?.pricingTiers || []);
    navigator.clipboard.writeText(briefText);
    setClaudeToast('Brief copied. Paste it into Claude.');
    setTimeout(() => setClaudeToast(null), 3000);
  };

  const handleDownloadBrief = (request: ProjectRequest) => {
    const briefText = buildClaudeBrief(request, producerData?.pricingTiers || []);
    const blob = new Blob([briefText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (request.appName || 'project').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `project_brief_${cleanName}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // INTAKE QUESTIONS CRUD
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionModal.item) return;

    const q = questionModal.item;
    const qId = q.id || `q-${Date.now()}`;
    const payload: IntakeQuestion = {
      id: qId,
      label: q.label || 'Untitled Question',
      section: q.section || 'Project scope',
      type: q.type || 'long_text',
      options: q.options || [],
      required: q.required ?? false,
      appliesTo: q.appliesTo || 'both',
      note: q.note || '',
      order: q.order || 1
    };

    try {
      await setDoc(doc(db, 'intake_questions', qId), payload);
      setQuestionModal({ isOpen: false, item: null });
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Error saving intake question:', err);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this intake question?')) return;
    try {
      await deleteDoc(doc(db, 'intake_questions', questionId));
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Error deleting intake question:', err);
    }
  };

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const questions = [...(producerData?.intakeQuestions || [])];
    const idx = questions.findIndex(q => q.id === questionId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    // Swap order
    const temp = questions[idx].order;
    questions[idx].order = questions[targetIdx].order;
    questions[targetIdx].order = temp;

    try {
      await setDoc(doc(db, 'intake_questions', questions[idx].id), questions[idx]);
      await setDoc(doc(db, 'intake_questions', questions[targetIdx].id), questions[targetIdx]);
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Error reordering questions:', err);
    }
  };

  // 2. Portfolio Save / Delete
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioModal.item) return;

    const item = portfolioModal.item;
    const techArray = typeof item.techStack === 'string'
      ? (item.techStack as string).split(',').map((s) => s.trim()).filter(Boolean)
      : (item.techStack || []);

    const payload = {
      title: item.title || '',
      category: item.category || 'Mobile & Web',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      videoUrl: item.videoUrl || '',
      techStack: techArray,
      updatedAt: serverTimestamp()
    };

    try {
      if (item.id) {
        await updateDoc(doc(db, 'portfolio', item.id), payload);
      } else {
        await addDoc(collection(db, 'portfolio'), {
          ...payload,
          createdAt: new Date().toISOString()
        });
      }
      setPortfolioModal({ isOpen: false, item: null });
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Save portfolio to Firestore error:', err);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!window.confirm('Delete this portfolio item?')) return;
    try {
      await deleteDoc(doc(db, 'portfolio', id));
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Delete portfolio from Firestore failed:', err);
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      await setDoc(doc(db, 'about', 'main'), {
        ...aboutForm,
        skills: skillsArray,
        updatedAt: serverTimestamp()
      });
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Failed to save About story to Firestore:', err);
    }
  };

  // Hero Background Video Handlers
  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroVideoUploadError(null);

    // Validation: max 30MB
    const MAX_SIZE_MB = 30;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setHeroVideoUploadError(`Video file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    if (!file.type.startsWith('video/')) {
      setHeroVideoUploadError('Please select a valid video file (MP4, WebM, QuickTime).');
      return;
    }

    setIsUploadingHeroVideo(true);
    try {
      const result = await uploadToCloudinaryDirect(file, 'video');
      setHeroVideoUrl(result.url);
      setManualHeroVideoUrl(result.url);

      // Persist in siteData/main
      await setDoc(doc(db, 'siteData', 'main'), {
        heroVideoUrl: result.url,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Mirror to about/main
      await setDoc(doc(db, 'about', 'main'), {
        heroVideoUrl: result.url,
        updatedAt: serverTimestamp()
      }, { merge: true });

      triggerSavedNotification();
    } catch (err: any) {
      console.error('Hero video upload failed:', err);
      setHeroVideoUploadError(err.message || 'Failed to upload video to Cloudinary.');
    } finally {
      setIsUploadingHeroVideo(false);
      e.target.value = '';
    }
  };

  const handleSaveManualHeroVideo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const trimmed = manualHeroVideoUrl.trim();
      setHeroVideoUrl(trimmed);
      setHeroVideoUploadError(null);

      await setDoc(doc(db, 'siteData', 'main'), {
        heroVideoUrl: trimmed,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, 'about', 'main'), {
        heroVideoUrl: trimmed,
        updatedAt: serverTimestamp()
      }, { merge: true });

      triggerSavedNotification();
    } catch (err) {
      console.error('Error saving hero video URL:', err);
      setHeroVideoUploadError('Failed to save hero video URL.');
    }
  };

  const handleRemoveHeroVideo = async () => {
    if (!window.confirm('Remove hero background video and revert to the handshake photo?')) return;
    try {
      setHeroVideoUrl('');
      setManualHeroVideoUrl('');
      setHeroVideoUploadError(null);

      await setDoc(doc(db, 'siteData', 'main'), {
        heroVideoUrl: '',
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, 'about', 'main'), {
        heroVideoUrl: '',
        updatedAt: serverTimestamp()
      }, { merge: true });

      triggerSavedNotification();
    } catch (err) {
      console.error('Error removing hero video:', err);
      setHeroVideoUploadError('Failed to remove video.');
    }
  };

  // Testimonials Save / Delete
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialModal.item) return;

    const item = testimonialModal.item;
    try {
      if (item.id) {
        await updateDoc(doc(db, 'testimonials', item.id), item);
      } else {
        await addDoc(collection(db, 'testimonials'), item);
      }
      setTestimonialModal({ isOpen: false, item: null });
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Save testimonial to Firestore error:', err);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Delete testimonial from Firestore failed:', err);
    }
  };

  // FAQ Save / Delete
  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqModal.item) return;

    const item = faqModal.item;
    try {
      if (item.id) {
        await updateDoc(doc(db, 'faqs', item.id), item);
      } else {
        await addDoc(collection(db, 'faqs'), item);
      }
      setFaqModal({ isOpen: false, item: null });
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Save FAQ to Firestore error:', err);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!window.confirm('Delete this FAQ entry?')) return;
    try {
      await deleteDoc(doc(db, 'faqs', id));
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Delete FAQ from Firestore failed:', err);
    }
  };

  // Save / Delete My Apps
  const handleSaveMyApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAppModal.item) return;
    const item = myAppModal.item;
    try {
      const payload = {
        ...item,
        updatedAt: new Date().toISOString()
      };
      if (item.id) {
        await updateDoc(doc(db, 'my_apps', item.id), payload);
      } else {
        await addDoc(collection(db, 'my_apps'), {
          ...payload,
          createdAt: new Date().toISOString()
        });
      }
      setMyAppModal({ isOpen: false, item: null });
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Save My App to Firestore error:', err);
    }
  };

  const handleDeleteMyApp = async (id: string) => {
    if (!window.confirm('Delete this app entry?')) return;
    try {
      await deleteDoc(doc(db, 'my_apps', id));
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Delete My App from Firestore failed:', err);
    }
  };

  // Save / Delete Pricing Tiers
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingModal.item) return;
    const item = pricingModal.item;
    try {
      if (item.id) {
        await updateDoc(doc(db, 'pricing_tiers', item.id), item);
      } else {
        await addDoc(collection(db, 'pricing_tiers'), item);
      }
      setPricingModal({ isOpen: false, item: null });
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Save pricing to Firestore error:', err);
    }
  };

  const handleDeletePricing = async (id: string) => {
    if (!window.confirm('Delete this pricing tier?')) return;
    try {
      await deleteDoc(doc(db, 'pricing_tiers', id));
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Delete pricing tier from Firestore failed:', err);
    }
  };

  // Save Email Settings & Business Email & WhatsApp
  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanPhone = whatsappNumber.replace(/\D/g, '') || '2349070392028';

      // Save in siteData/main for customer intake confirmation
      await setDoc(doc(db, 'siteData', 'main'), {
        whatsappNumber: cleanPhone,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, 'settings', 'email'), {
        notifyEmail,
        businessEmail,
        whatsappNumber: cleanPhone,
        enabled: notifyEnabled,
        staleAlertDays,
        updatedAt: serverTimestamp()
      }, { merge: true });
      fetchProducerData();
      triggerSavedNotification();
    } catch (err) {
      console.error('Failed to update email settings in Firestore:', err);
    }
  };

  if (!isOpen) return null;

  // Render Passcode Prompt if locked
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-slate-900">Producer Access Portal</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Enter passcode to unlock admin controls & client requests.
          </p>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            {passcodeError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passcodeError}</span>
              </div>
            )}

            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full text-center tracking-widest text-lg px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isVerifying ? 'Unlocking...' : 'Unlock Producer Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter requests
  const requests = producerData?.requests || [];
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.appName.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.email.toLowerCase().includes(requestSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter call bookings
  const bookings = producerData?.bookings || [];
  const newBookingsCount = bookings.filter((b) => b.status === 'New').length;
  const filteredBookings = bookings.filter((b) => {
    const term = bookingSearch.toLowerCase();
    const matchesSearch =
      (b.name || '').toLowerCase().includes(term) ||
      (b.email || '').toLowerCase().includes(term) ||
      (b.phone || '').toLowerCase().includes(term) ||
      (b.topic || '').toLowerCase().includes(term);
    const matchesStatus = bookingStatusFilter === 'All' || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const showBusinessEmailWarning = !businessEmail || businessEmail === 'yourbusiness@email.com';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-[95vw] max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto relative">
        
        {/* Saved Confirmation Toast Banner */}
        {savedToast && (
          <div className="absolute top-3 right-16 z-50 bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 animate-in fade-in slide-in-from-top-2 duration-200 border border-emerald-400">
            <CheckCircle className="w-4 h-4 text-white" />
            <span>Saved ✓</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
              <Unlock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight leading-none text-white">
                Dee-Maker Producer Portal
              </h2>
              <span className="text-xs text-slate-400">Admin Mode (Dee-Maker)</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Business Email Warning Banner */}
        {showBusinessEmailWarning && (
          <div className="bg-amber-500 text-slate-950 px-6 py-2 text-xs font-black flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
              <span>Set your business email so customers can email you via Fast Review.</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className="underline uppercase tracking-wider text-[11px] font-black hover:text-white cursor-pointer ml-2"
            >
              Configure Now →
            </button>
          </div>
        )}

        {/* Portal Navigation Tabs */}
        <div className="bg-slate-950 border-b border-white/10 px-4 sm:px-6 flex space-x-1.5 sm:space-x-2 overflow-x-auto flex-shrink-0 text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-3.5 rounded-t-xl font-black uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-t-2 border-cyan-400'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Requests ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-3.5 rounded-t-xl font-black uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'bookings'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-t-2 border-cyan-400'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Bookings</span>
            {newBookingsCount > 0 ? (
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-black rounded-full bg-cyan-400 text-slate-950">
                {newBookingsCount}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-normal">
                ({bookings.length})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-3.5 rounded-t-xl font-black uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'questions'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-t-2 border-cyan-400'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Intake Questions ({producerData?.intakeQuestions?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-3 px-3.5 rounded-t-xl font-black uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-t-2 border-cyan-400'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Portfolio ({producerData?.portfolio?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('my-apps')}
            className={`py-3 px-3.5 rounded-t-xl font-black uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'my-apps'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-t-2 border-cyan-400'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>My Apps ({producerData?.myApps?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-3.5 rounded-t-xl font-black uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'pricing'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-t-2 border-cyan-400'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Packages ({producerData?.pricingTiers?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3.5 rounded-t-xl font-black uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-t-2 border-cyan-400'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit2 className="w-4 h-4" />
            <span>About Story</span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`py-3 px-3.5 rounded-t-xl font-black uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'testimonials'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-t-2 border-cyan-400'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Testimonials</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-3 px-3.5 rounded-t-xl font-black uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'faqs'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-t-2 border-cyan-400'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQs</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-3 px-3 border-b-2 font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'feedback'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Private Feedback ({producerData?.privateFeedback?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 px-3 border-b-2 font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications & Email</span>
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {isLoadingData ? (
            <div className="py-20 text-center text-slate-500 font-medium">
              Loading producer records...
            </div>
          ) : (
            <>
              {/* TAB 1: REQUESTS PIPELINE */}
              {activeTab === 'requests' && (
                <div className="space-y-6">
                  
                  {/* Analytics Dashboard Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">{requests.length}</div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">New Pipeline</div>
                      <div className="text-2xl font-black text-blue-700 mt-1">
                        {requests.filter(r => r.status === 'New').length}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Delivered</div>
                      <div className="text-2xl font-black text-emerald-700 mt-1">
                        {requests.filter(r => r.status === 'Delivered').length}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Conversion Rate</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">
                        {requests.length > 0
                          ? Math.round((requests.filter(r => r.status === 'Delivered').length / requests.length) * 100)
                          : 0}%
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-rose-200 bg-rose-50/40 col-span-2 sm:col-span-1">
                      <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Stale (&gt; {staleAlertDays}d)</span>
                      </div>
                      <div className="text-2xl font-black text-rose-700 mt-1">
                        {requests.filter(r => {
                          if (r.status !== 'New') return false;
                          const age = Math.floor((new Date().getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                          return age >= staleAlertDays;
                        }).length}
                      </div>
                    </div>
                  </div>

                  {/* Controls bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={requestSearch}
                        onChange={(e) => setRequestSearch(e.target.value)}
                        placeholder="Search by name or app..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      {/* Status Filter */}
                      <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">Status:</span>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none"
                        >
                          <option value="All">All Requests</option>
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>

                      {/* Export CSV Button */}
                      <button
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                        title="Export All Requests to CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Requests Grid / Table */}
                  {filteredRequests.length === 0 ? (
                    <div className="py-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                      No project requests match your criteria.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Requests List */}
                      <div className="lg:col-span-6 space-y-3">
                        {filteredRequests.map((reqItem) => {
                          const isSelected = selectedRequest?.id === reqItem.id;
                          const ageInDays = Math.floor((new Date().getTime() - new Date(reqItem.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                          const isStale = reqItem.status === 'New' && ageInDays >= staleAlertDays;

                          return (
                            <div
                              key={reqItem.id}
                              onClick={() => {
                                setSelectedRequest(reqItem);
                                setEditingNotes(reqItem.notes || '');
                              }}
                              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                                isSelected
                                  ? 'bg-blue-50/80 border-blue-600 shadow-sm'
                                  : isStale
                                  ? 'bg-rose-50/40 border-rose-300'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {/* Stale Alert Banner */}
                              {isStale && (
                                <div className="mb-2 bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center space-x-1 w-fit">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>⚠️ Stale: In 'New' for {ageInDays} days without follow-up</span>
                                </div>
                              )}

                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold text-slate-900 text-base">
                                    {reqItem.appName}
                                  </h4>
                                  <p className="text-xs text-slate-600 font-medium">
                                    by {reqItem.name} ({reqItem.email})
                                  </p>
                                </div>

                                <div className="flex flex-col items-end space-y-1">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                      reqItem.status === 'New'
                                        ? 'bg-blue-100 text-blue-800'
                                        : reqItem.status === 'Contacted'
                                        ? 'bg-amber-100 text-amber-800'
                                        : reqItem.status === 'In Progress'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {reqItem.status}
                                  </span>

                                  {reqItem.paymentStatus && (
                                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                      reqItem.paymentStatus === 'Fully Paid'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : reqItem.paymentStatus === 'Deposit Paid'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      💳 {reqItem.paymentStatus}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2 text-xs font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded w-fit border border-blue-100">
                                Tier: {reqItem.selectedPackage || 'Custom Build'} ({reqItem.projectType === 'website' ? 'Website' : 'Mobile App'})
                              </div>

                              <p className="text-xs text-slate-500 line-clamp-2 mt-2">
                                {reqItem.appDescription}
                              </p>

                              <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
                                <span>Prefers: <strong className="text-slate-700 capitalize">{reqItem.preferredContact}</strong></span>
                                <span>{new Date(reqItem.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right: Selected Request Detail View */}
                      <div className="lg:col-span-6">
                        {selectedRequest ? (
                          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 sticky top-0">
                            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                              <div>
                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                  Request Details
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                                  {selectedRequest.appName}
                                </h3>
                              </div>

                              <button
                                onClick={() => handleDeleteRequest(selectedRequest.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete request"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>

                            {/* PART 3: PRODUCER PORTAL SEND TO CLAUDE SECTION */}
                            <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-xl space-y-3 shadow-md">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Sparkles className="w-4 h-4 text-purple-300" />
                                  <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">AI Developer Handoff</span>
                                </div>
                                {claudeToast && (
                                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50">
                                    {claudeToast}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-200 leading-snug">
                                Copy formatted brief to clipboard for Claude or download as markdown file.
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSendToClaude(selectedRequest)}
                                  className="px-3.5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Send to Claude</span>
                                </button>

                                <a
                                  href="https://claude.ai/new"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 border border-white/20 cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
                                  <span>Open Claude</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadBrief(selectedRequest)}
                                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1 border border-slate-700 cursor-pointer"
                                  title="Download brief as .md file"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>.md</span>
                                </button>
                              </div>
                            </div>

                            {/* Status Pipeline Buttons */}
                            <div>
                              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                                Pipeline Status
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(['New', 'Contacted', 'In Progress', 'Delivered'] as RequestStatus[]).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleStatusChange(selectedRequest.id, st)}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                      selectedRequest.status === st
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Payment Status Selector */}
                            <div>
                              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                                Payment Status
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {(['Unpaid', 'Deposit Paid', 'Fully Paid'] as PaymentStatus[]).map((ps) => (
                                  <button
                                    key={ps}
                                    onClick={() => handlePaymentStatusChange(selectedRequest.id, ps)}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                      (selectedRequest.paymentStatus || 'Unpaid') === ps
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {ps}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Contact & Meta Info */}
                            <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <div>
                                <span className="text-xs text-slate-400 block">Client Name:</span>
                                <span className="font-semibold text-slate-800">{selectedRequest.name}</span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block">Package Tier Selected:</span>
                                <span className="font-bold text-blue-700">{selectedRequest.selectedPackage || 'Custom Build'} ({selectedRequest.projectType === 'website' ? 'Website' : 'Mobile App'})</span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block">Source / Channel:</span>
                                <span className="font-medium text-slate-800">{selectedRequest.heardFrom || 'Unspecified'}</span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block">Email Address:</span>
                                <a href={`mailto:${selectedRequest.email}`} className="text-blue-600 hover:underline font-medium">
                                  {selectedRequest.email}
                                </a>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block">Phone / WhatsApp:</span>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="font-medium text-slate-800">{selectedRequest.phone || 'N/A'}</span>
                                  {(() => {
                                    const cleanPhone = selectedRequest.phone ? selectedRequest.phone.replace(/\D/g, '') : '';
                                    if (!cleanPhone) return null;
                                    return (
                                      <a
                                        href={`https://wa.me/${cleanPhone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                                        title="Open WhatsApp chat with customer"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>Open WhatsApp</span>
                                      </a>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block">Preferred Follow-up:</span>
                                <span className="font-bold text-slate-900 uppercase text-xs">{selectedRequest.preferredContact}</span>
                              </div>
                            </div>

                            {/* Full Questionnaire Responses */}
                            {selectedRequest.questionnaireAnswers && selectedRequest.questionnaireAnswers.length > 0 && (
                              <div className="space-y-3">
                                <span className="text-xs font-bold uppercase text-slate-400 block">
                                  Detailed Questionnaire Answers
                                </span>
                                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                                  {selectedRequest.questionnaireAnswers.map((q, idx) => {
                                    const valStr = Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;
                                    if (!valStr || valStr === 'Not specified') return null;
                                    return (
                                      <div key={idx} className="border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
                                        <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-blue-800">{q.section} → {q.label}</span>
                                        <span className="text-slate-700 whitespace-pre-line mt-0.5 block">{valStr}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* App Description */}
                            <div>
                              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                                App Description / Problem Summary
                              </span>
                              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                                {selectedRequest.appDescription}
                              </p>
                            </div>

                            {/* Gemini Generated Confirmation */}
                            <div>
                              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                                AI Confirmation Output (Shown to Client)
                              </span>
                              <p className="text-xs text-slate-600 italic bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                "{selectedRequest.aiConfirmationMessage}"
                              </p>
                            </div>

                            {/* Internal Notes */}
                            <div>
                              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                                Internal Notes (Admin only)
                              </label>
                              <textarea
                                rows={2}
                                value={editingNotes}
                                onChange={(e) => setEditingNotes(e.target.value)}
                                placeholder="Add client notes, price quotes, or progress details..."
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                              />
                              <button
                                onClick={() => handleSaveRequestNotes(selectedRequest.id)}
                                className="mt-2 text-xs font-semibold text-blue-600 hover:underline flex items-center cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5 mr-1" />
                                Save Notes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                            Select a request from the list to view details and update pipeline status.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CALL BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
                      <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">New Requests</div>
                      <div className="text-2xl font-black text-blue-700 mt-1">
                        {bookings.filter(b => b.status === 'New').length}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
                      <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Confirmed Calls</div>
                      <div className="text-2xl font-black text-amber-700 mt-1">
                        {bookings.filter(b => b.status === 'Confirmed').length}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
                      <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Completed / Done</div>
                      <div className="text-2xl font-black text-emerald-700 mt-1">
                        {bookings.filter(b => b.status === 'Done').length}
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        placeholder="Search by client, email, topic, or phone..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-600">Status:</span>
                      <select
                        value={bookingStatusFilter}
                        onChange={(e) => setBookingStatusFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none"
                      >
                        <option value="All">All Bookings</option>
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>

                  {/* Bookings List Cards */}
                  {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                      <PhoneCall className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">No Call Bookings Found</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {bookingSearch || bookingStatusFilter !== 'All'
                          ? 'No call bookings match your current search or filter criteria.'
                          : 'When visitors schedule a 15-minute intro call, their bookings will appear here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredBookings.map((b) => {
                        const rawPhone = b.phone ? b.phone.replace(/\D/g, '') : '';
                        const formattedPhone = rawPhone.startsWith('0') && rawPhone.length === 11 
                          ? '234' + rawPhone.slice(1) 
                          : rawPhone;

                        const waReplyText = encodeURIComponent(`Hi ${b.name}, this is Dee-Maker. Your intro call on ${b.date} at ${b.time} is confirmed.`);
                        const emailSubject = encodeURIComponent(`Intro Call Confirmation — Dee-Maker Studio`);
                        const emailBody = encodeURIComponent(`Hi ${b.name},\n\nThis is Dee-Maker. Your intro call on ${b.date} at ${b.time} is confirmed.\n\nLooking forward to speaking with you!\n\nBest regards,\nDee-Maker Engineering`);

                        return (
                          <div 
                            key={b.id} 
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-md space-y-4"
                          >
                            {/* Card Top: Client Name, Status Selector, Created Time */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                                  {b.name ? b.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div>
                                  <h4 className="text-base font-black text-slate-900 leading-tight">{b.name}</h4>
                                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>Requested: {new Date(b.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Selector */}
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                                <select
                                  value={b.status}
                                  onChange={(e) => handleBookingStatusChange(b.id, e.target.value as BookingStatus)}
                                  className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none transition-colors ${
                                    b.status === 'New'
                                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                                      : b.status === 'Confirmed'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  }`}
                                >
                                  <option value="New">New</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Done">Done</option>
                                </select>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Reserved Date & Time</span>
                                <div className="font-extrabold text-blue-700 text-sm">
                                  {b.date} at {b.time}
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">West Africa Time (WAT)</span>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Client Email</span>
                                <a href={`mailto:${b.email}`} className="font-semibold text-slate-800 hover:text-blue-600 transition-colors break-all">
                                  {b.email}
                                </a>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Phone / WhatsApp</span>
                                {b.phone ? (
                                  <span className="font-semibold text-slate-800">{b.phone}</span>
                                ) : (
                                  <span className="text-slate-400 italic">Not provided</span>
                                )}
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Discussion Topic</span>
                                <span className="font-medium text-slate-700 line-clamp-2">{b.topic || 'App Architecture Overview'}</span>
                              </div>
                            </div>

                            {/* Action Buttons — ALWAYS VISIBLE (not hover-only, friendly on phone) */}
                            <div className="flex flex-wrap items-center gap-2.5 pt-1">
                              {/* Reply on WhatsApp Button (only if phone exists) */}
                              {b.phone && formattedPhone ? (
                                <a
                                  href={`https://wa.me/${formattedPhone}?text=${waReplyText}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                  <span>Reply on WhatsApp</span>
                                </a>
                              ) : null}

                              {/* Reply by Email Button */}
                              <a
                                href={`mailto:${b.email}?subject=${emailSubject}&body=${emailBody}`}
                                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5 mr-1.5" />
                                <span>Reply by Email</span>
                              </a>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(b.id)}
                                className="inline-flex items-center px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ml-auto"
                                title="Delete this booking"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INTAKE QUESTIONS MANAGER */}
              {activeTab === 'questions' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Manage Intake Questions</h3>
                      <p className="text-xs text-slate-500">Add, edit, reorder, or delete questions shown in the customer intake form.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuestionModal({
                        isOpen: true,
                        item: {
                          label: '',
                          section: 'Project scope',
                          type: 'long_text',
                          required: false,
                          appliesTo: 'both',
                          options: [],
                          order: (producerData?.intakeQuestions?.length || 0) + 1
                        }
                      })}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer w-fit"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Question</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {['Project scope', 'Technical and access', 'Business logic', 'Practical / contract'].map((sectionName) => {
                      const sectionQs = (producerData?.intakeQuestions || []).filter(q => q.section === sectionName);
                      if (sectionQs.length === 0) return null;

                      return (
                        <div key={sectionName} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="font-bold text-slate-900 text-sm">{sectionName}</h4>
                            <span className="text-xs font-semibold text-slate-400">{sectionQs.length} questions</span>
                          </div>

                          <div className="space-y-2">
                            {sectionQs.map((q, idx) => (
                              <div key={q.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                    <span className="font-bold text-slate-900 text-xs">{q.label}</span>
                                    {q.required && (
                                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded">
                                        Required
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded capitalize">
                                      {q.appliesTo === 'both' ? 'App & Website' : q.appliesTo}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-mono rounded">
                                      {q.type}
                                    </span>
                                  </div>

                                  {q.note && (
                                    <p className="text-[11px] text-slate-500 italic">Note: {q.note}</p>
                                  )}

                                  {q.options && q.options.length > 0 && (
                                    <p className="text-[11px] text-slate-600 font-mono">Options: {q.options.join(', ')}</p>
                                  )}
                                </div>

                                {/* EDIT AND DELETE BUTTONS MUST BE ALWAYS VISIBLE */}
                                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveQuestion(q.id, 'up')}
                                    disabled={idx === 0}
                                    className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-30 cursor-pointer"
                                    title="Move Up"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveQuestion(q.id, 'down')}
                                    disabled={idx === sectionQs.length - 1}
                                    className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-30 cursor-pointer"
                                    title="Move Down"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setQuestionModal({ isOpen: true, item: q })}
                                    className="px-2.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                                    title="Edit Question"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="px-2.5 py-1.5 bg-rose-500 text-white hover:bg-rose-600 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                                    title="Delete Question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: PORTFOLIO MANAGER */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Manage Portfolio Items</h3>
                      <p className="text-xs text-slate-500">Add, edit, or delete past client projects.</p>
                    </div>
                    <button
                      onClick={() =>
                        setPortfolioModal({
                          isOpen: true,
                          item: { title: '', category: 'iOS & Android', description: '', imageUrl: '', videoUrl: '', techStack: [] },
                        })
                      }
                      className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1 inline" /> Add Project
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(producerData?.portfolio || []).map((port) => (
                      <div key={port.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-blue-600">{port.category}</span>
                              <h4 className="font-bold text-slate-900 text-base">{port.title}</h4>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setPortfolioModal({ isOpen: true, item: port })}
                                className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePortfolio(port.id)}
                                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">{port.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MY APPS */}
              {activeTab === 'my-apps' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Manage My Showcase Apps</h3>
                      <p className="text-xs text-slate-500">Showcase app builds created directly by Dee-Maker.</p>
                    </div>
                    <button
                      onClick={() =>
                        setMyAppModal({
                          isOpen: true,
                          item: { name: '', description: '', howItWasMade: '', updateNotes: '', images: [], downloadUrl: '', fileName: '' },
                        })
                      }
                      className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1 inline" /> Add App Showcase
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(producerData?.myApps || []).map((app) => (
                      <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">{app.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{app.description}</p>
                          </div>
                          <div className="flex space-x-1 shrink-0">
                            <button onClick={() => setMyAppModal({ isOpen: true, item: app })} className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteMyApp(app.id)} className="p-1 text-slate-400 hover:text-red-600 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PRICING PACKAGES */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Manage Pricing Tiers & Packages</h3>
                      <p className="text-xs text-slate-500">Update packages for Mobile Apps and Web Platforms.</p>
                    </div>
                    <button
                      onClick={() =>
                        setPricingModal({
                          isOpen: true,
                          item: { name: '', category: 'app', price: '$1,500', tagline: '', turnaround: '2-3 weeks', bestFor: '', features: [] },
                        })
                      }
                      className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1 inline" /> Add Pricing Tier
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(producerData?.pricingTiers || []).map((tier) => (
                      <div key={tier.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {tier.category === 'website' ? 'Website' : 'App'}
                              </span>
                              <h4 className="font-bold text-slate-900 text-base mt-1">{tier.name}</h4>
                            </div>
                            <div className="flex space-x-1 shrink-0">
                              <button onClick={() => setPricingModal({ isOpen: true, item: tier })} className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeletePricing(tier.id)} className="p-1 text-slate-400 hover:text-red-600 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-lg font-black text-slate-900 mt-2">{tier.price}</p>
                          <p className="text-xs text-slate-500 italic mt-1">{tier.tagline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: ABOUT STORY & HERO MEDIA */}
              {activeTab === 'about' && (
                <div className="space-y-6 max-w-2xl">
                  {/* Hero Background Video Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Video className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-lg font-bold text-slate-900">Hero Background Video</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Upload or paste a looping handshake video to play behind the homepage Hero section. Sits behind the colorful gradient overlay.
                        </p>
                      </div>
                      {heroVideoUrl ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Video Active</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-200">
                          Handshake Photo Active
                        </span>
                      )}
                    </div>

                    {/* Video Preview or Handshake Fallback */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-200 flex items-center justify-center">
                      {heroVideoUrl ? (
                        <video
                          key={heroVideoUrl}
                          src={heroVideoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <img
                            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80"
                            alt="Handshake fallback"
                            className="w-full h-full object-cover animate-ken-burns"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center text-center p-4">
                            <span className="text-white text-xs font-bold bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/20">
                              No video set — using Ken Burns animated handshake photo
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {heroVideoUploadError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{heroVideoUploadError}</span>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="space-y-3 pt-1">
                      {/* Direct Upload Button */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Upload Video File (Max 30MB)
                        </label>
                        <div className="flex items-center space-x-3">
                          <label className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md ${
                            isUploadingHeroVideo ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}>
                            {isUploadingHeroVideo ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                <span>Uploading to Cloudinary (up to 30MB)...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                <span>Choose Handshake Video...</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/ogg,video/quicktime"
                              disabled={isUploadingHeroVideo}
                              onChange={handleHeroVideoUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[11px] text-slate-400">Direct Cloudinary upload (MP4/WebM)</span>
                        </div>
                      </div>

                      {/* Manual Video URL Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Or Paste Video URL Manually
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={manualHeroVideoUrl}
                            onChange={(e) => setManualHeroVideoUrl(e.target.value)}
                            placeholder="https://res.cloudinary.com/.../handshake.mp4"
                            className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleSaveManualHeroVideo}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Save URL
                          </button>
                        </div>
                      </div>

                      {/* Remove Video Button */}
                      {heroVideoUrl && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleRemoveHeroVideo}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Video & Use Photo</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* About Bio Form */}
                  <form onSubmit={handleSaveAbout} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Edit Developer / Studio Story</h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={aboutForm.title}
                        onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Story Paragraphs</label>
                      <textarea
                        rows={6}
                        value={aboutForm.story}
                        onChange={(e) => setAboutForm({ ...aboutForm, story: e.target.value })}
                        className="w-full p-2.5 border rounded-lg text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Years Experience</label>
                        <input
                          type="number"
                          value={aboutForm.yearsExperience}
                          onChange={(e) => setAboutForm({ ...aboutForm, yearsExperience: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Apps Built</label>
                        <input
                          type="number"
                          value={aboutForm.appsBuilt}
                          onChange={(e) => setAboutForm({ ...aboutForm, appsBuilt: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (Comma separated)</label>
                      <input
                        type="text"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        placeholder="React Native, TypeScript, Express, Firebase"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      Save About Bio
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: TESTIMONIALS */}
              {activeTab === 'testimonials' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Client Testimonials</h3>
                      <p className="text-xs text-slate-500">Public quotes shown on the homepage.</p>
                    </div>
                    <button
                      onClick={() =>
                        setTestimonialModal({
                          isOpen: true,
                          item: { clientName: '', company: '', role: '', quote: '', rating: 5 },
                        })
                      }
                      className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1 inline" /> Add Testimonial
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(producerData?.testimonials || []).map((test) => (
                      <div key={test.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-slate-800">{test.clientName}</span>
                            <div className="flex space-x-1">
                              <button onClick={() => setTestimonialModal({ isOpen: true, item: test })} className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteTestimonial(test.id)} className="p-1 text-slate-400 hover:text-red-600 cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">{test.role} at {test.company}</p>
                          <p className="text-xs text-slate-700 italic mt-3">"{test.quote}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: FAQS */}
              {activeTab === 'faqs' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Manage FAQ Entries</h3>
                      <p className="text-xs text-slate-500">Answer pricing, turnaround, and process questions.</p>
                    </div>
                    <button
                      onClick={() =>
                        setFaqModal({
                          isOpen: true,
                          item: { question: '', answer: '' },
                        })
                      }
                      className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1 inline" /> Add FAQ
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(producerData?.faqs || []).map((faq) => (
                      <div key={faq.id} className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{faq.question}</h4>
                          <div className="flex space-x-1">
                            <button onClick={() => setFaqModal({ isOpen: true, item: faq })} className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteFAQ(faq.id)} className="p-1 text-slate-400 hover:text-red-600 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 whitespace-pre-line">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: PRIVATE FEEDBACK */}
              {activeTab === 'feedback' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Visitor Feedback Submissions</h3>
                  <div className="space-y-3">
                    {(producerData?.privateFeedback || []).map((feed) => (
                      <div key={feed.id} className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-bold text-slate-800">{feed.name} ({feed.email})</span>
                          <span>{new Date(feed.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {feed.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 10: EMAIL NOTIFICATIONS & BUSINESS EMAIL */}
              {activeTab === 'email' && (
                <div className="space-y-6 max-w-xl">
                  <form onSubmit={handleSaveEmailSettings} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Email Alerts & Contact Settings</h3>
                    <p className="text-xs text-slate-500">
                      Configure your business email for client Fast Review emails and notification alerts.
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Business Email Address (Fast Review Target) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="e.g. contact@deemaker.com"
                        className="w-full px-3 py-2 border rounded-lg text-sm font-medium"
                        required
                      />
                      <span className="text-[11px] text-slate-500 block mt-1">
                        When customers tap "Fast Review by Email", their email client opens with To: set to this address.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp Direct Phone Number (International format)
                      </label>
                      <input
                        type="text"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g. 2349070392028"
                        className="w-full px-3 py-2 border rounded-lg text-sm font-medium"
                      />
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Digits only with country code (e.g. 2349070392028). Used by the green "Send to WhatsApp" button on the customer confirmation screen.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Admin Notification Email Address
                      </label>
                      <input
                        type="email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notify-enabled"
                        checked={notifyEnabled}
                        onChange={(e) => setNotifyEnabled(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="notify-enabled" className="text-sm text-slate-800 font-medium">
                        Enable instant notification alerts on new requests
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      Save Email Preferences
                    </button>
                  </form>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Notification Alert Logs</h4>
                    <div className="space-y-2 text-xs font-mono text-slate-600 bg-slate-900 text-emerald-400 p-4 rounded-xl max-h-48 overflow-y-auto">
                      {(producerData?.emailSettings?.logs || []).map((log, idx) => (
                        <div key={idx}>{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* INTAKE QUESTION MODAL */}
      {questionModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {questionModal.item?.id ? 'Edit Question' : 'Add Intake Question'}
            </h3>
            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Label / Prompt</label>
                <input
                  type="text"
                  value={questionModal.item?.label || ''}
                  onChange={(e) => setQuestionModal({ ...questionModal, item: { ...questionModal.item, label: e.target.value } })}
                  placeholder="e.g. What problem is your app solving?"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={questionModal.item?.section || 'Project scope'}
                    onChange={(e) => setQuestionModal({ ...questionModal, item: { ...questionModal.item, section: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="Project scope">Project scope</option>
                    <option value="Technical and access">Technical and access</option>
                    <option value="Business logic">Business logic</option>
                    <option value="Practical / contract">Practical / contract</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Applies To</label>
                  <select
                    value={questionModal.item?.appliesTo || 'both'}
                    onChange={(e) => setQuestionModal({ ...questionModal, item: { ...questionModal.item, appliesTo: e.target.value as any } })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="both">Both (App & Website)</option>
                    <option value="app">App Category Only</option>
                    <option value="website">Website Category Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Input Type</label>
                  <select
                    value={questionModal.item?.type || 'long_text'}
                    onChange={(e) => setQuestionModal({ ...questionModal, item: { ...questionModal.item, type: e.target.value as any } })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="short_text">Short Text (Single line)</option>
                    <option value="long_text">Long Text (Multi-line paragraph)</option>
                    <option value="select">Dropdown Select</option>
                    <option value="multi_select">Multi-Select Checkboxes</option>
                    <option value="yes_no">Yes / No Toggle</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={questionModal.item?.required || false}
                      onChange={(e) => setQuestionModal({ ...questionModal, item: { ...questionModal.item, required: e.target.checked } })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Is Required?</span>
                  </label>
                </div>
              </div>

              {(questionModal.item?.type === 'select' || questionModal.item?.type === 'multi_select') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Options (Comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(questionModal.item?.options) ? questionModal.item?.options.join(', ') : questionModal.item?.options || ''}
                    onChange={(e) => setQuestionModal({ ...questionModal, item: { ...questionModal.item, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                    placeholder="e.g. Option 1, Option 2, Option 3"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note / Hint Text (Optional)</label>
                <input
                  type="text"
                  value={questionModal.item?.note || ''}
                  onChange={(e) => setQuestionModal({ ...questionModal, item: { ...questionModal.item, note: e.target.value } })}
                  placeholder="e.g. Links welcome or You can send files later"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setQuestionModal({ isOpen: false, item: null })} className="px-4 py-2 border rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PORTFOLIO EDIT MODAL */}
      {portfolioModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {portfolioModal.item?.id ? 'Edit Portfolio Item' : 'New Portfolio Item'}
            </h3>
            <form onSubmit={handleSavePortfolio} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={portfolioModal.item?.title || ''}
                  onChange={(e) =>
                    setPortfolioModal({
                      ...portfolioModal,
                      item: { ...portfolioModal.item, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={portfolioModal.item?.category || ''}
                  onChange={(e) =>
                    setPortfolioModal({
                      ...portfolioModal,
                      item: { ...portfolioModal.item, category: e.target.value },
                    })
                  }
                  placeholder="iOS & Android, Web App, etc."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPortfolioModal({ isOpen: false, item: null })}
                  className="px-4 py-2 border rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TESTIMONIAL MODAL */}
      {testimonialModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {testimonialModal.item?.id ? 'Edit Testimonial' : 'New Testimonial'}
            </h3>
            <form onSubmit={handleSaveTestimonial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={testimonialModal.item?.clientName || ''}
                  onChange={(e) =>
                    setTestimonialModal({
                      ...testimonialModal,
                      item: { ...testimonialModal.item, clientName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={testimonialModal.item?.company || ''}
                    onChange={(e) =>
                      setTestimonialModal({
                        ...testimonialModal,
                        item: { ...testimonialModal.item, company: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={testimonialModal.item?.role || ''}
                    onChange={(e) =>
                      setTestimonialModal({
                        ...testimonialModal,
                        item: { ...testimonialModal.item, role: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quote</label>
                <textarea
                  rows={3}
                  value={testimonialModal.item?.quote || ''}
                  onChange={(e) =>
                    setTestimonialModal({
                      ...testimonialModal,
                      item: { ...testimonialModal.item, quote: e.target.value },
                    })
                  }
                  className="w-full p-2.5 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setTestimonialModal({ isOpen: false, item: null })} className="px-4 py-2 border rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer">Save Testimonial</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {faqModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {faqModal.item?.id ? 'Edit FAQ' : 'New FAQ'}
            </h3>
            <form onSubmit={handleSaveFAQ} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  value={faqModal.item?.question || ''}
                  onChange={(e) =>
                    setFaqModal({
                      ...faqModal,
                      item: { ...faqModal.item, question: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Answer</label>
                <textarea
                  rows={4}
                  value={faqModal.item?.answer || ''}
                  onChange={(e) =>
                    setFaqModal({
                      ...faqModal,
                      item: { ...faqModal.item, answer: e.target.value },
                    })
                  }
                  className="w-full p-2.5 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setFaqModal({ isOpen: false, item: null })} className="px-4 py-2 border rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer">Save FAQ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MY APPS MODAL */}
      {myAppModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {myAppModal.item?.id ? 'Edit App Entry' : 'New App Showcase'}
            </h3>
            <form onSubmit={handleSaveMyApp} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">App Name</label>
                <input
                  type="text"
                  value={myAppModal.item?.name || ''}
                  onChange={(e) => setMyAppModal({ ...myAppModal, item: { ...myAppModal.item, name: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={myAppModal.item?.description || ''}
                  onChange={(e) => setMyAppModal({ ...myAppModal, item: { ...myAppModal.item, description: e.target.value } })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setMyAppModal({ isOpen: false, item: null })} className="px-4 py-2 border rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold cursor-pointer">Save App</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRICING MODAL */}
      {pricingModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {pricingModal.item?.id ? 'Edit Pricing Tier' : 'New Pricing Tier'}
            </h3>
            <form onSubmit={handleSavePricing} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={pricingModal.item?.name || ''}
                    onChange={(e) => setPricingModal({ ...pricingModal, item: { ...pricingModal.item, name: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={pricingModal.item?.category || 'app'}
                    onChange={(e) => setPricingModal({ ...pricingModal, item: { ...pricingModal.item, category: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="app">App</option>
                    <option value="website">Website</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={pricingModal.item?.price || ''}
                    onChange={(e) => setPricingModal({ ...pricingModal, item: { ...pricingModal.item, price: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="$1,200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={pricingModal.item?.tagline || ''}
                    onChange={(e) => setPricingModal({ ...pricingModal, item: { ...pricingModal.item, tagline: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="Perfect for startups"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Features (one per line)</label>
                <textarea
                  rows={4}
                  value={(pricingModal.item?.features || []).join('\n')}
                  onChange={(e) => setPricingModal({ ...pricingModal, item: { ...pricingModal.item, features: e.target.value.split('\n').filter(s => s.trim() !== '') } })}
                  className="w-full p-2.5 border rounded-lg text-sm font-mono"
                  placeholder="Feature 1&#10;Feature 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turnaround</label>
                  <input
                    type="text"
                    value={pricingModal.item?.turnaround || ''}
                    onChange={(e) => setPricingModal({ ...pricingModal, item: { ...pricingModal.item, turnaround: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="2-3 weeks"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Best For</label>
                  <input
                    type="text"
                    value={pricingModal.item?.bestFor || ''}
                    onChange={(e) => setPricingModal({ ...pricingModal, item: { ...pricingModal.item, bestFor: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="E-commerce sites"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setPricingModal({ isOpen: false, item: null })} className="px-4 py-2 border rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer">Save Tier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
