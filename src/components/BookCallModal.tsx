import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  X, 
  Check, 
  PhoneCall, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
  businessEmail?: string;
}

// Generate the next 7 available days starting tomorrow (skipping Sundays)
function generateNextAvailableDays(): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = [];
  const current = new Date();
  current.setDate(current.getDate() + 1);

  while (result.length < 7) {
    if (current.getDay() !== 0) { // 0 is Sunday
      const label = current.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      result.push({ label, value: label });
    }
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export const BookCallModal: React.FC<BookCallModalProps> = ({ 
  isOpen, 
  onClose,
  whatsappNumber: propWhatsappNumber,
  businessEmail: propBusinessEmail
}) => {
  const { t } = useLanguage();

  // Dynamic available days starting tomorrow, skipping Sundays
  const availableDates = useMemo(() => generateNextAvailableDays(), []);

  const [selectedDate, setSelectedDate] = useState<string>(() => availableDates[0]?.value || '');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('');

  // Submission & status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [booked, setBooked] = useState(false);

  // Settings
  const [whatsappNumber, setWhatsappNumber] = useState<string>(propWhatsappNumber || '2349070392028');
  const [businessEmail, setBusinessEmail] = useState<string>(propBusinessEmail || 'deemakers01@gmail.com');

  // Load configured WhatsApp number and Business Email
  useEffect(() => {
    if (!isOpen) return;

    // Reset date default if empty
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0].value);
    }

    const loadSettings = async () => {
      try {
        const siteDoc = await getDoc(doc(db, 'siteData', 'main'));
        if (siteDoc.exists() && siteDoc.data()?.whatsappNumber) {
          setWhatsappNumber(siteDoc.data().whatsappNumber);
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
      } catch (_) {
        // Fallback to defaults or server data
        try {
          const res = await fetch('/api/data');
          if (res.ok) {
            const data = await res.json();
            if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
            if (data.businessEmail) setBusinessEmail(data.businessEmail);
          }
        } catch (__) {}
      }
    };

    loadSettings();
  }, [isOpen, availableDates, selectedDate]);

  if (!isOpen) return null;

  const times = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  // Clean WhatsApp number to international digits
  const getCleanWhatsAppNumber = (num?: string): string => {
    if (!num) return '2349070392028';
    let digits = num.replace(/\D/g, '');
    if (!digits) return '2349070392028';
    if (digits.startsWith('0') && digits.length === 11) {
      digits = '234' + digits.slice(1);
    }
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date: selectedDate,
          time: selectedTime,
          topic: topic.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to reserve call. Please check your details and try again.');
      }

      setBooked(true);
    } catch (err: any) {
      console.error('Call booking error:', err);
      setErrorMessage(err.message || 'Unable to schedule your call. Please check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp click handler
  const handleSendToWhatsApp = () => {
    const targetPhone = getCleanWhatsAppNumber(whatsappNumber);
    const text = `Hi Dee-Maker, I just requested a 15-min intro call. Name: ${name}. Date: ${selectedDate}. Time: ${selectedTime}. Topic: ${topic || 'App Architecture Overview'}. Email: ${email}.${phone ? ` Phone: ${phone}.` : ''}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${targetPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  // Mailto click handler
  const handleSendByEmail = () => {
    const targetEmail = businessEmail && businessEmail !== 'yourbusiness@email.com' ? businessEmail : 'deemakers01@gmail.com';
    const subject = `15-Min Intro Call Request — ${name} — ${selectedDate} ${selectedTime}`;
    const bodyText = `Hi Dee-Maker,\n\nI just requested a 15-min intro call.\n\nName: ${name}\nDate: ${selectedDate}\nTime: ${selectedTime}\nTopic: ${topic || 'App Architecture Overview'}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nLooking forward to speaking with you!`;
    window.location.href = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  };

  const handleResetAndClose = () => {
    setBooked(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B1020] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden text-white max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10 border border-white/15"
        >
          <X className="w-5 h-5" />
        </button>

        {booked ? (
          /* Request Received Screen */
          <div className="text-center py-6 sm:py-8 space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Request received!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto font-medium leading-relaxed">
                Thanks <span className="font-bold text-white">{name}</span>! Dee-Maker got your request for <span className="font-bold text-cyan-300">{selectedDate} at {selectedTime}</span> and will confirm your time shortly.
              </p>
            </div>

            {/* Call Details Summary Box */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-white/10 text-left text-xs text-slate-300 space-y-2 font-medium">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="font-bold text-white">Reserved Slot:</span>
                <span className="text-cyan-300 font-bold">{selectedDate} at {selectedTime} (WAT)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="font-bold text-white">Email:</span>
                <span className="text-slate-300">{email}</span>
              </div>
              {phone && (
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="font-bold text-white">Phone / WhatsApp:</span>
                  <span className="text-slate-300">{phone}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="font-bold text-white">Location:</span>
                <span className="text-slate-300">Google Meet / WhatsApp Video</span>
              </div>
              <div className="pt-0.5">
                <span className="font-bold text-white block mb-0.5">Discussion Topic:</span>
                <span className="text-slate-300">{topic || 'App Architecture & Scope Overview'}</span>
              </div>
            </div>

            {/* Direct Confirmation Actions (WhatsApp + Email + Done) */}
            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-400 font-semibold">
                Fast-track your confirmation directly with Dee-Maker:
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Green Send to WhatsApp button */}
                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-emerald-500/25 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Send to WhatsApp</span>
                </button>

                {/* Send by Email button */}
                <button
                  type="button"
                  onClick={handleSendByEmail}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer border border-cyan-400/30"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Send by Email</span>
                </button>

                {/* Done & Close button */}
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors cursor-pointer shadow-lg"
                >
                  <span>Done & Close</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg border border-white/20">
                <PhoneCall className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{t.modalBookCallTitle}</h3>
                <p className="text-xs text-slate-400 font-medium">{t.modalBookCallSub}</p>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-semibold flex items-start space-x-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Select Date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select Date</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableDates.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setSelectedDate(d.value)}
                      className={`py-2.5 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        selectedDate === d.value
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-cyan-400/50 shadow-lg'
                          : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Time */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select Time Slot</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {times.map((tItem) => (
                    <button
                      key={tItem}
                      type="button"
                      onClick={() => setSelectedTime(tItem)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        selectedTime === tItem
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-cyan-400/50 shadow-lg'
                          : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {tItem}
                    </button>
                  ))}
                </div>
                {/* Note under times */}
                <p className="text-[11px] text-cyan-300/85 mt-2 font-medium flex items-center space-x-1.5">
                  <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Times shown in West Africa Time (WAT)</span>
                </p>
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Your Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/15 bg-slate-950/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Your Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/15 bg-slate-950/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Phone / WhatsApp Field (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Phone / WhatsApp number <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 907 039 2028 or 080..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/15 bg-slate-950/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium"
                  />
                </div>
              </div>

              {/* Topic Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Brief App Concept / Question <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. iOS fitness tracker MVP timeline"
                  className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-slate-950/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glow-btn w-full py-3.5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer border border-white/20 disabled:opacity-60 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>Saving Reservation...</span>
                    </>
                  ) : (
                    <span>Request Intro Call ({selectedTime})</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
