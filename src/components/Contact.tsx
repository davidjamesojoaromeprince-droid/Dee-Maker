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
    <section id="contact" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
                {t.contactBadge}
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-3">
                {t.contactTitle}
              </h2>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                {t.contactSub}
              </p>
            </div>

            <div className="space-y-4">
              {/* Email Card */}
              <a
                href="mailto:deemakers01@gmail.com"
                className="flex items-center p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Dee-Maker</div>
                  <div className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    deemakers01@gmail.com
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Response within 24 hours</div>
                </div>
              </a>

              {/* WhatsApp Card */}
              <a
                href="https://wa.me/2348059264736"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MessageSquare className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp Direct</div>
                  <div className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    08059264736
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Instant messaging & quick calls</div>
                </div>
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 mb-1">
                <HeartHandshake className="w-4 h-4 text-blue-600" />
                <span>Working Hours & Availability</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monday – Friday: 09:00 – 18:00 (UTC).
                Active client projects receive direct priority communication.
              </p>
            </div>
          </div>

          {/* Right Column: Private Feedback Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50/80 rounded-2xl p-6 sm:p-8 border border-slate-200/80">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Private Site Feedback
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Send confidential notes, questions, or comments directly to Dee-Maker.
              </p>

              {submitted ? (
                <div className="py-8 text-center bg-white rounded-xl border border-slate-200 p-6">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-slate-900">Thank You for Your Feedback!</h4>
                  <p className="text-slate-600 text-sm mt-1">
                    Your note has been received by the Dee-Maker team.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Send another note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Private Message / Feedback
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your feedback, site comments, or general question..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="w-4 h-4 mr-2" />
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
