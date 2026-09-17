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
  Globe
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
  PrivateFeedback
} from '../types';
import { uploadToCloudinaryDirect } from '../lib/cloudinaryUpload';

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

  const triggerSavedNotification = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
    if (onDataUpdated) {
      onDataUpdated();
    }
  };

  // Active Tab: 'requests' | 'portfolio' | 'my-apps' | 'pricing' | 'about' | 'testimonials' | 'faqs' | 'feedback' | 'email'
  const [activeTab, setActiveTab] = useState<'requests' | 'portfolio' | 'my-apps' | 'pricing' | 'about' | 'testimonials' | 'faqs' | 'feedback' | 'email'>('requests');

  const [producerData, setProducerData] = useState<FullProducerData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Search & Filter state for Requests
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Selected Request detail view
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  // Portfolio Item Form State
  const [portfolioModal, setPortfolioModal] = useState<{
    isOpen: boolean;
    item: Partial<PortfolioItem> | null;
  }>({ isOpen: false, item: null });

  // File Upload states for Portfolio Form
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingAppFile, setIsUploadingAppFile] = useState(false);
  const [isUploadingMyAppImage, setIsUploadingMyAppImage] = useState(false);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [heroImageUploadError, setHeroImageUploadError] = useState<string | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [appFileUploadError, setAppFileUploadError] = useState<string | null>(null);
  const [showManualImageUrl, setShowManualImageUrl] = useState(false);
  const [showManualVideoUrl, setShowManualVideoUrl] = useState(false);
  const [showManualAppUrl, setShowManualAppUrl] = useState(false);

  // Handle Hero Image Upload (Max 30MB)
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      setHeroImageUploadError('File exceeds the 30MB limit for images/videos.');
      e.target.value = '';
      return;
    }

    setIsUploadingHeroImage(true);
    setHeroImageUploadError(null);

    try {
      const data = await uploadToCloudinaryDirect(file, 'image');
      if (data && data.url) {
        setAboutForm(prev => ({ ...prev, heroImage: data.url, heroImageUrl: data.url }));
      } else {
        setHeroImageUploadError('Upload failed');
      }
    } catch (err: any) {
      setHeroImageUploadError(err?.message || 'Connection error');
    } finally {
      setIsUploadingHeroImage(false);
      e.target.value = '';
    }
  };

  // Handle Portfolio Image File Upload (Max 30MB)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 30MB file size limit
    if (file.size > 30 * 1024 * 1024) {
      setImageUploadError('File exceeds the 30MB limit for images/videos.');
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const data = await uploadToCloudinaryDirect(file, 'image');

      if (data && data.url) {
        setPortfolioModal((prev) => ({
          ...prev,
          item: { ...prev.item, imageUrl: data.url },
        }));
      } else {
        setImageUploadError('Failed to upload image to Cloudinary.');
      }
    } catch (err: any) {
      setImageUploadError(err.message || 'Error connecting to upload server.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Handle Portfolio Video File Upload (Max 30MB)
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 30MB file size limit
    if (file.size > 30 * 1024 * 1024) {
      setVideoUploadError('File exceeds the 30MB limit for images/videos.');
      e.target.value = '';
      return;
    }

    setIsUploadingVideo(true);
    setVideoUploadError(null);

    try {
      const data = await uploadToCloudinaryDirect(file, 'video');

      if (data && data.url) {
        setPortfolioModal((prev) => ({
          ...prev,
          item: { ...prev.item, videoUrl: data.url },
        }));
      } else {
        setVideoUploadError('Failed to upload video to Cloudinary.');
      }
    } catch (err: any) {
      setVideoUploadError(err.message || 'Error connecting to upload server.');
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  // Handle MyApp Image Upload (Max 30MB)
  const handleMyAppImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setImageUploadError('File exceeds the 30MB limit for images/videos.');
      e.target.value = '';
      return;
    }
    setIsUploadingMyAppImage(true);
    setImageUploadError(null);
    try {
      const data = await uploadToCloudinaryDirect(file, 'image');
      if (data && data.url) {
        setMyAppModal(prev => ({
          ...prev,
          item: {
            ...prev.item,
            images: [...(prev.item?.images || []), data.url]
          }
        }));
      }
    } catch (err: any) {
      console.error('MyApp image upload error:', err);
      setImageUploadError(err.message || 'Failed to upload screenshot.');
    } finally {
      setIsUploadingMyAppImage(false);
      e.target.value = '';
    }
  };
  
  // Handle MyApp build upload (Max 100MB)
  const handleMyAppBuildUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      setAppFileUploadError('File exceeds the 100MB limit for app packages.');
      e.target.value = '';
      return;
    }
    setIsUploadingAppFile(true);
    setAppFileUploadError(null);
    try {
      const data = await uploadToCloudinaryDirect(file, 'raw');
      if (data && data.url) {
        setMyAppModal(prev => ({
          ...prev,
          item: {
            ...prev.item,
            downloadUrl: data.url,
            fileName: file.name
          }
        }));
      }
    } catch (err: any) {
      console.error('MyApp build upload error:', err);
      setAppFileUploadError(err.message || 'Failed to upload build file.');
    } finally {
      setIsUploadingAppFile(false);
      e.target.value = '';
    }
  };

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
    skills: [],
    heroImage: '',
    heroImageUrl: ''
  });
  const [skillsInput, setSkillsInput] = useState('');

  // Email Notification settings
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [staleAlertDays, setStaleAlertDays] = useState(3);

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
      const feedbackSnap = await getDocs(query(collection(db, 'feedback'), orderBy('createdAt', 'desc')));
      const settingsDoc = await getDoc(doc(db, 'settings', 'email'));

      const data: FullProducerData = {
        about: aboutDoc.exists() ? aboutDoc.data() as any : null,
        portfolio: portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        testimonials: testimonialsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        faqs: faqsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        pricingTiers: pricingSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        myApps: myAppsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        requests: requestsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        privateFeedback: feedbackSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[],
        emailSettings: settingsDoc.exists() ? settingsDoc.data() as any : { notifyEmail: '', enabled: true, logs: [] }
      };

      setProducerData(data);
      if (data.about) {
        setAboutForm(data.about);
        setSkillsInput((data.about.skills || []).join(', '));
      }
      if (data.emailSettings) {
        setNotifyEmail(data.emailSettings.notifyEmail || 'deemakers01@gmail.com');
        setNotifyEnabled(data.emailSettings.enabled ?? true);
        if (data.emailSettings.staleAlertDays) {
          setStaleAlertDays(data.emailSettings.staleAlertDays);
        }
      }
    } catch (err) {
      console.error('Error fetching producer data from Firestore:', err);
      // Fallback to API if Firestore fails (permissions, etc)
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

  // 4. Testimonials Save / Delete
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

  // 5. FAQ Save / Delete
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

  // 12. Save / Delete My Apps
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

  // 13. Save / Delete Pricing Tiers
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

  // 6. Save Email Settings
  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'email'), {
        notifyEmail,
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

        {/* Portal Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex space-x-1 sm:space-x-4 overflow-x-auto flex-shrink-0 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-3 border-b-2 font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Requests ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-3 px-3 border-b-2 font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'portfolio'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Portfolio ({producerData?.portfolio?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('my-apps')}
            className={`py-3 px-3 border-b-2 font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'my-apps'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>My Apps ({producerData?.myApps?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-3 border-b-2 font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pricing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Packages ({producerData?.pricingTiers?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3 border-b-2 font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'about'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Edit2 className="w-4 h-4" />
            <span>About Story</span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`py-3 px-3 border-b-2 font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'testimonials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Testimonials</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-3 px-3 border-b-2 font-semibold flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'faqs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
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
            <span>Notifications</span>
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
                                Tier: {reqItem.selectedPackage || 'Custom Build'}
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
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete request"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
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
                                <span className="font-bold text-blue-700">{selectedRequest.selectedPackage || 'Custom Build'}</span>
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

                            {/* App Description */}
                            <div>
                              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                                App Description
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
                                className="mt-2 text-xs font-semibold text-blue-600 hover:underline flex items-center"
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

              {/* TAB 2: PORTFOLIO MANAGER */}
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
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Portfolio Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(producerData?.portfolio || []).map((port) => (
                      <div key={port.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {port.category}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() =>
                                  setPortfolioModal({
                                    isOpen: true,
                                    item: {
                                      ...port,
                                      techStack: (port.techStack || []).join(', ') as any,
                                    },
                                  })
                                }
                                className="p-1 text-slate-400 hover:text-blue-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePortfolio(port.id)}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-bold text-slate-900 mt-2">{port.title}</h4>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{port.description}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400">
                          <span className="truncate max-w-[200px]">Tech: {(port.techStack || []).join(', ')}</span>
                          <div className="flex items-center space-x-2">
                            {port.videoUrl && <span className="text-blue-600 font-medium">Video Demo</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: MY APPS MANAGER */}
              {activeTab === 'my-apps' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Manage My Apps</h3>
                      <p className="text-xs text-slate-500">Add proprietary apps for public download.</p>
                    </div>
                    <button
                      onClick={() =>
                        setMyAppModal({
                          isOpen: true,
                          item: { name: '', description: '', images: [], howItWasMade: '', updateNotes: '' },
                        })
                      }
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Proprietary App
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(producerData?.myApps || []).map((app) => (
                      <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              Proprietary App
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setMyAppModal({ isOpen: true, item: app })}
                                className="p-1 text-slate-400 hover:text-indigo-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMyApp(app.id)}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-bold text-slate-900 mt-2">{app.name}</h4>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{app.description}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs text-slate-400">
                           <span className="truncate">{app.images?.length || 0} Screenshots</span>
                           {app.downloadUrl && <span className="text-emerald-600 font-medium">Build Uploaded</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: PRICING PACKAGES */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Manage Pricing Tiers</h3>
                      <p className="text-xs text-slate-500">Edit App and Website packages.</p>
                    </div>
                    <button
                      onClick={() =>
                        setPricingModal({
                          isOpen: true,
                          item: { name: '', tagline: '', price: '', period: 'per project', features: [], turnaround: '', bestFor: '', category: 'app' },
                        })
                      }
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Tier
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* App Packages */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">App Development Packages</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(producerData?.pricingTiers || []).filter(p => p.category === 'app').map((tier) => (
                          <div key={tier.id} className="bg-white rounded-xl border border-slate-200 p-4 relative group">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-slate-900">{tier.name}</h5>
                              <div className="flex space-x-1">
                                <button onClick={() => setPricingModal({ isOpen: true, item: tier })} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" title="Edit Tier"><Edit2 size={16}/></button>
                                <button onClick={() => handleDeletePricing(tier.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" title="Delete Tier"><Trash2 size={16}/></button>
                              </div>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{tier.price}</p>
                            <p className="text-xs text-slate-500 mb-4">{tier.tagline}</p>
                            <div className="space-y-1">
                              {tier.features.slice(0, 3).map((f, i) => (
                                <p key={i} className="text-[11px] text-slate-600 truncate">• {f}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Website Packages */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Website Development Packages</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(producerData?.pricingTiers || []).filter(p => p.category === 'website').map((tier) => (
                          <div key={tier.id} className="bg-white rounded-xl border border-slate-200 p-4 relative group">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-slate-900">{tier.name}</h5>
                              <div className="flex space-x-1">
                                <button onClick={() => setPricingModal({ isOpen: true, item: tier })} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" title="Edit Tier"><Edit2 size={16}/></button>
                                <button onClick={() => handleDeletePricing(tier.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" title="Delete Tier"><Trash2 size={16}/></button>
                              </div>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{tier.price}</p>
                            <p className="text-xs text-slate-500 mb-4">{tier.tagline}</p>
                            <div className="space-y-1">
                              {tier.features.slice(0, 3).map((f, i) => (
                                <p key={i} className="text-[11px] text-slate-600 truncate">• {f}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ABOUT STORY */}
              {activeTab === 'about' && (
                <form onSubmit={handleSaveAbout} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-w-2xl">
                  <h3 className="text-lg font-bold text-slate-900">Edit About Story & Bio</h3>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                      Profile / Hero Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {aboutForm.heroImageUrl || aboutForm.heroImage ? (
                          <img src={aboutForm.heroImageUrl || aboutForm.heroImage} alt="Hero" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-linear-to-br from-blue-50 to-indigo-50">
                            <ImageIcon className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <label className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer transition-colors flex items-center">
                            <Upload className="w-3.5 h-3.5 mr-2" />
                            {isUploadingHeroImage ? 'Uploading...' : 'Upload New Photo'}
                            <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" disabled={isUploadingHeroImage} />
                          </label>
                          {(aboutForm.heroImageUrl || aboutForm.heroImage) && (
                            <button 
                              type="button" 
                              onClick={() => setAboutForm({ ...aboutForm, heroImage: '', heroImageUrl: '' })}
                              className="px-4 py-2 bg-white text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors flex items-center"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Recommended: Square or portrait aspect ratio. Max 30MB.
                        </p>
                        {heroImageUploadError && (
                          <p className="text-[10px] text-red-600 font-bold">{heroImageUploadError}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={aboutForm.title}
                      onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        value={aboutForm.yearsExperience}
                        onChange={(e) => setAboutForm({ ...aboutForm, yearsExperience: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Apps Delivered
                      </label>
                      <input
                        type="number"
                        value={aboutForm.appsBuilt}
                        onChange={(e) => setAboutForm({ ...aboutForm, appsBuilt: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Story & Background (Paragraphs)
                    </label>
                    <textarea
                      rows={6}
                      value={aboutForm.story}
                      onChange={(e) => setAboutForm({ ...aboutForm, story: e.target.value })}
                      className="w-full p-3 border rounded-lg text-sm leading-relaxed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Skills & Tech Stack (Comma separated)
                    </label>
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
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                  >
                    Save About Bio
                  </button>
                </form>
              )}

              {/* TAB 4: TESTIMONIALS */}
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
                      className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700"
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
                              <button
                                onClick={() => setTestimonialModal({ isOpen: true, item: test })}
                                className="p-1 text-slate-400 hover:text-blue-600"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(test.id)}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
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

              {/* TAB 5: FAQS */}
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
                      className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700"
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
                            <button
                              onClick={() => setFaqModal({ isOpen: true, item: faq })}
                              className="p-1 text-slate-400 hover:text-blue-600"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                            >
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

              {/* TAB 6: PRIVATE FEEDBACK */}
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

              {/* TAB 7: EMAIL NOTIFICATIONS */}
              {activeTab === 'email' && (
                <div className="space-y-6 max-w-xl">
                  <form onSubmit={handleSaveEmailSettings} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Email Alerts & Notifications</h3>
                    <p className="text-xs text-slate-500">
                      Configure email notification triggers when new client intake requests are submitted.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Notification Email Address
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
                      className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700"
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

              {/* PORTFOLIO COVER IMAGE FILE PICKER */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Portfolio Image <span className="text-red-500">*</span>
                </label>

                {portfolioModal.item?.imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-48 group">
                      <img
                        src={portfolioModal.item.imageUrl}
                        alt="Portfolio Preview"
                        className="w-full h-36 object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                        <label className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow cursor-pointer hover:bg-slate-100 flex items-center">
                          <Upload className="w-3.5 h-3.5 mr-1 text-blue-600" />
                          Replace Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setPortfolioModal((prev) => ({
                              ...prev,
                              item: { ...prev.item, imageUrl: '' },
                            }))
                          }
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow hover:bg-red-700 flex items-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[220px] text-slate-600 font-mono">
                        {portfolioModal.item.imageUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPortfolioModal((prev) => ({
                            ...prev,
                            item: { ...prev.item, imageUrl: '' },
                          }))
                        }
                        className="text-red-600 hover:underline font-medium cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
                      {isUploadingImage ? (
                        <div className="py-3 flex flex-col items-center justify-center space-y-2 text-blue-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs font-semibold">Uploading image to Cloudinary...</span>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            id="portfolio-image-upload"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="portfolio-image-upload"
                            className="cursor-pointer flex flex-col items-center justify-center space-y-1.5 py-2"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              Select Image from Device Gallery
                            </span>
                            <span className="text-[11px] text-slate-500">
                              JPG, PNG, WEBP or GIF (Max 30MB)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    {!showManualImageUrl && (
                      <button
                        type="button"
                        onClick={() => setShowManualImageUrl(true)}
                        className="text-[11px] text-blue-600 hover:underline font-medium flex items-center cursor-pointer"
                      >
                        <Link className="w-3 h-3 mr-1" />
                        Or paste image URL manually
                      </button>
                    )}

                    {showManualImageUrl && (
                      <div className="mt-2 space-y-1">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={portfolioModal.item?.imageUrl || ''}
                          onChange={(e) =>
                            setPortfolioModal({
                              ...portfolioModal,
                              item: { ...portfolioModal.item, imageUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                {imageUploadError && (
                  <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{imageUploadError}</span>
                  </div>
                )}
              </div>

              {/* PORTFOLIO DEMO VIDEO FILE PICKER */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Demo Video (Optional)
                </label>

                {portfolioModal.item?.videoUrl ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black max-h-48">
                      {portfolioModal.item.videoUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) ||
                      portfolioModal.item.videoUrl.includes('portfolio-uploads') ? (
                        <video
                          src={portfolioModal.item.videoUrl}
                          controls
                          className="w-full h-36 object-contain"
                        />
                      ) : (
                        <div className="p-3 text-white text-xs space-y-1">
                          <span className="font-semibold text-blue-400 block">External Video URL:</span>
                          <span className="truncate block font-mono text-[11px] text-slate-300">
                            {portfolioModal.item.videoUrl}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <label className="text-blue-600 hover:underline font-medium cursor-pointer flex items-center">
                        <Upload className="w-3 h-3 mr-1" />
                        Replace Video
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setPortfolioModal((prev) => ({
                            ...prev,
                            item: { ...prev.item, videoUrl: '' },
                          }))
                        }
                        className="text-red-600 hover:underline font-medium cursor-pointer"
                      >
                        Remove Video
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
                      {isUploadingVideo ? (
                        <div className="py-3 flex flex-col items-center justify-center space-y-2 text-purple-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs font-semibold">Uploading video to Cloudinary...</span>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="video/*"
                            id="portfolio-video-upload"
                            onChange={handleVideoFileUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="portfolio-video-upload"
                            className="cursor-pointer flex flex-col items-center justify-center space-y-1.5 py-2"
                          >
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                              <Video className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              Select Video from Device Gallery
                            </span>
                            <span className="text-[11px] text-slate-500">
                              MP4, WebM, MOV or M4V (Max 30MB)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    {!showManualVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setShowManualVideoUrl(true)}
                        className="text-[11px] text-blue-600 hover:underline font-medium flex items-center cursor-pointer"
                      >
                        <Link className="w-3 h-3 mr-1" />
                        Or paste video URL manually
                      </button>
                    )}

                    {showManualVideoUrl && (
                      <div className="mt-2 space-y-1">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={portfolioModal.item?.videoUrl || ''}
                          onChange={(e) =>
                            setPortfolioModal({
                              ...portfolioModal,
                              item: { ...portfolioModal.item, videoUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                {videoUploadError && (
                  <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{videoUploadError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tech Stack (Comma separated)</label>
                <input
                  type="text"
                  value={portfolioModal.item?.techStack as any || ''}
                  onChange={(e) =>
                    setPortfolioModal({
                      ...portfolioModal,
                      item: { ...portfolioModal.item, techStack: e.target.value as any },
                    })
                  }
                  placeholder="React Native, TypeScript, Firebase"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Note</label>
                <textarea
                  rows={3}
                  value={portfolioModal.item?.description || ''}
                  onChange={(e) =>
                    setPortfolioModal({
                      ...portfolioModal,
                      item: { ...portfolioModal.item, description: e.target.value },
                    })
                  }
                  className="w-full p-2.5 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPortfolioModal({ isOpen: false, item: null })}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
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
                <button
                  type="button"
                  onClick={() => setTestimonialModal({ isOpen: false, item: null })}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
                  Save Quote
                </button>
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
              {faqModal.item?.id ? 'Edit FAQ Entry' : 'New FAQ Entry'}
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
                <button
                  type="button"
                  onClick={() => setFaqModal({ isOpen: false, item: null })}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MY APP MODAL */}
      {myAppModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {myAppModal.item?.id ? 'Edit My App' : 'New My App'}
            </h3>
            <form onSubmit={handleSaveMyApp} className="space-y-4 text-xs">
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
                  rows={3}
                  value={myAppModal.item?.description || ''}
                  onChange={(e) => setMyAppModal({ ...myAppModal, item: { ...myAppModal.item, description: e.target.value } })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Screenshots ({myAppModal.item?.images?.length || 0}) <span className="text-[11px] font-normal text-slate-500">(Max 30MB)</span>
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {myAppModal.item?.images?.map((url: string, i: number) => (
                    <div key={i} className="relative group aspect-video">
                      <img src={url} className="w-full h-full object-cover rounded border" />
                      <button 
                        type="button"
                        onClick={() => setMyAppModal({ ...myAppModal, item: { ...myAppModal.item, images: myAppModal.item.images.filter((_: any, idx: number) => idx !== i) } })}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" onChange={handleMyAppImageUpload} className="hidden" id="myapp-img-upload" disabled={isUploadingMyAppImage} />
                <label htmlFor="myapp-img-upload" className="inline-block px-3 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200">
                  {isUploadingMyAppImage ? 'Uploading...' : '+ Upload Screenshot'}
                </label>
                {imageUploadError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{imageUploadError}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    App Installer Package / Build File (Optional)
                  </label>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    APK, IPA, ZIP (Max 100MB)
                  </span>
                </div>

                {myAppModal.item?.downloadUrl ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-slate-900 truncate">
                            {myAppModal.item.fileName || 'Attached App Package'}
                          </span>
                          <span className="block text-[11px] text-slate-500 truncate font-mono">
                            {myAppModal.item.downloadUrl}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <label className="px-2.5 py-1.5 bg-white text-slate-700 text-xs font-semibold rounded-lg shadow-xs hover:bg-slate-50 border border-slate-200 cursor-pointer flex items-center">
                          <Upload className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Replace
                          <input
                            type="file"
                            accept=".apk,.ipa,.zip,application/vnd.android.package-archive,application/zip,application/octet-stream,application/x-zip-compressed"
                            onChange={handleMyAppBuildUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setMyAppModal((prev) => ({
                              ...prev,
                              item: { ...prev.item, downloadUrl: '', fileName: '' },
                            }))
                          }
                          className="px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg border border-red-200 flex items-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Download Display Filename
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MyClientApp-release.apk"
                        value={myAppModal.item?.fileName || ''}
                        onChange={(e) =>
                          setMyAppModal({
                            ...myAppModal,
                            item: { ...myAppModal.item, fileName: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
                      {isUploadingAppFile ? (
                        <div className="py-3 flex flex-col items-center justify-center space-y-2 text-emerald-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs font-semibold">Uploading installer package (up to 100MB)...</span>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept=".apk,.ipa,.zip,application/vnd.android.package-archive,application/zip,application/octet-stream,application/x-zip-compressed"
                            id="myapp-app-upload"
                            onChange={handleMyAppBuildUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="myapp-app-upload"
                            className="cursor-pointer flex flex-col items-center justify-center space-y-1.5 py-2"
                          >
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                              <Package className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              Select App Package from Device
                            </span>
                            <span className="text-[11px] text-slate-500">
                              APK (Android), IPA (iOS), or ZIP bundle (Max 100MB)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    {!showManualAppUrl && (
                      <button
                        type="button"
                        onClick={() => setShowManualAppUrl(true)}
                        className="text-[11px] text-emerald-600 hover:underline font-medium flex items-center cursor-pointer"
                      >
                        <Link className="w-3 h-3 mr-1" />
                        Or paste app download URL manually
                      </button>
                    )}

                    {showManualAppUrl && (
                      <div className="mt-2 space-y-2">
                        <input
                          type="url"
                          placeholder="https://... (Direct APK/ZIP download link)"
                          value={myAppModal.item?.downloadUrl || ''}
                          onChange={(e) =>
                            setMyAppModal({
                              ...myAppModal,
                              item: { ...myAppModal.item, downloadUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Custom display filename (e.g. MyClientApp.apk)"
                          value={myAppModal.item?.fileName || ''}
                          onChange={(e) =>
                            setMyAppModal({
                              ...myAppModal,
                              item: { ...myAppModal.item, fileName: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                {appFileUploadError && (
                  <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{appFileUploadError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">How it was made</label>
                <textarea
                  rows={3}
                  value={myAppModal.item?.howItWasMade || ''}
                  onChange={(e) => setMyAppModal({ ...myAppModal, item: { ...myAppModal.item, howItWasMade: e.target.value } })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  placeholder="Tech stack, challenges, etc."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setMyAppModal({ isOpen: false, item: null })} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold">Save App</button>
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
                <button type="button" onClick={() => setPricingModal({ isOpen: false, item: null })} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Save Tier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
