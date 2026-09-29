import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle, HeartHandshake } from 'lucide-react';
import { db } from '../lib/firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';

export const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please provide your name, email, and feedback message.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save to Firestore
      try {
        await addDoc(collection(db, 'feedback'), {
          name,
          email,
          message,
          rating,
          createdAt: new Date().toISOString(),
          timestamp: serverTimestamp()
        });
      } catch (fsErr) {
        console.error('Firestore feedback save failed:', fsErr);
      }

      // 2. Call API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, rating }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Error submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-20 md:py-28 bg-[#0B1020] border-b border-indigo-900/40 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
                {t.contactBadge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4">
                {t.contactTitle}
              </h2>
              <p className="text-slate-300 mt-2 text-sm leading-relaxed font-medium">
                {t.contactSub}
              </p>
            </div>

            <div className="space-y-4">
              {/* Email Card */}
              <a
                href="mailto:deemakers01@gmail.com"
                className="flex items-center p-5 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-xl hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-cyan-300 flex items-center justify-center mr-4 border border-blue-400/30 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-md">
                  <Mail className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Dee-Maker</div>
                  <div className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                    deemakers01@gmail.com
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">Response within 24 hours</div>
                </div>
              </a>

              {/* WhatsApp Card */}
              <a
                href="https://wa.me/2348059264736"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-5 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-xl hover:border-emerald-400/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mr-4 border border-emerald-400/30 group-hover:bg-gradient-to-tr group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:text-white transition-all shadow-md">
                  <MessageSquare className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp Direct</div>
                  <div className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                    08059264736
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">Instant messaging & quick calls</div>
                </div>
              </a>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center space-x-2 text-sm font-bold text-white mb-1">
                <HeartHandshake className="w-4 h-4 text-cyan-400" />
                <span>Working Hours & Availability</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed mt-1">
                Monday – Friday: 09:00 – 18:00 (UTC).
                Active client projects receive direct priority communication.
              </p>
            </div>
          </div>

          {/* Right Column: Private Feedback Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-xl shadow-2xl">
              <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">
                Private Site Feedback
              </h3>
              <p className="text-slate-300 text-sm mb-6 font-medium">
                Send confidential notes, questions, or comments directly to Dee-Maker.
              </p>

              {submitted ? (
                <div className="py-8 text-center bg-slate-950/80 rounded-2xl border border-white/15 p-6">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-lg font-black text-white">Thank You for Your Feedback!</h4>
                  <p className="text-slate-300 text-sm mt-1 font-medium">
                    Your note has been received by the Dee-Maker team.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs font-black text-cyan-300 hover:underline uppercase tracking-wider"
                  >
                    Send another note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full px-4 py-3 rounded-xl border border-white/15 bg-slate-950/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-white/15 bg-slate-950/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Private Message / Feedback
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your feedback, site comments, or general question..."
                      className="w-full px-4 py-3 rounded-xl border border-white/15 bg-slate-950/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-medium"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="glow-btn w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all disabled:opacity-60 cursor-pointer border border-white/20 shadow-xl"
                  >
                    <Send className="w-4 h-4 mr-2 text-cyan-300" />
                    Submit Private Feedback
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
