import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, Sparkles, PhoneCall, Send, Layers } from 'lucide-react';
import { FAQItem } from '../types';
import { fadeInReveal, tapScale } from '../lib/motionPresets';

interface FaqDetailPageProps {
  faqId: string;
  faqs: FAQItem[];
  onBack: () => void;
  onOpenIntake: () => void;
  onOpenBookCall: () => void;
}

export const FaqDetailPage: React.FC<FaqDetailPageProps> = ({
  faqId,
  faqs,
  onBack,
  onOpenIntake,
  onOpenBookCall
}) => {
  const faq = faqs.find(f => f.id === faqId) || {
    id: faqId,
    question: "Detailed Project Guide",
    answer: "Comprehensive information regarding Dee-Maker engineering standards and processes."
  };

  // Detailed rich content mapping based on FAQ topic
  const renderDetailedContent = () => {
    switch (faqId) {
      case 'faq-1': // Timeline
        return (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/60 border border-blue-200/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <Clock size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">4 to 8 Weeks to Production Launch</h3>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">
                At Dee-Maker, we eliminate unnecessary bureaucratic drag. By utilizing rigorous component architectures and battle-tested TypeScript libraries, we deliver production-ready apps at startup velocity without ever compromising code quality.
              </p>
            </div>

            <h4 className="text-lg font-black uppercase text-slate-900 tracking-tight">The 4-Stage Development Roadmap</h4>

            <div className="grid gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">01</span>
                  <h5 className="font-black text-slate-900 uppercase tracking-tight text-base">Week 1: Scoping & System Architecture</h5>
                </div>
                <p className="text-slate-500 font-medium text-sm leading-relaxed pl-11">
                  We map out database schemas, API routes, user flows, and wireframes. You receive an interactive Figma prototype and clear technical specifications before a single line of code is written.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">02</span>
                  <h5 className="font-black text-slate-900 uppercase tracking-tight text-base">Week 2-3: Core UI & Frontend Engineering</h5>
                </div>
                <p className="text-slate-500 font-medium text-sm leading-relaxed pl-11">
                  Building responsive React Native screens and web interfaces with Tailwind CSS. Every touch target, animation transition, and state handler is polished for 60fps performance.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">03</span>
                  <h5 className="font-black text-slate-900 uppercase tracking-tight text-base">Week 4-5: Backend, Payments & Integration</h5>
                </div>
                <p className="text-slate-500 font-medium text-sm leading-relaxed pl-11">
                  Integrating Firebase/Firestore/PostgreSQL backends, secure JWT authentication, Stripe billing webhooks, and push notification services.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">04</span>
                  <h5 className="font-black text-slate-900 uppercase tracking-tight text-base">Week 6-8: QA Testing & App Store Deployment</h5>
                </div>
                <p className="text-slate-500 font-medium text-sm leading-relaxed pl-11">
                  Rigorous device testing across iOS and Android form factors, TestFlight beta distribution, and full submission support through Apple App Store and Google Play Console review.
                </p>
              </div>
            </div>
          </div>
        );

      case 'faq-2': // Native vs Cross-Platform
        return (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/60 border border-blue-200/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <Layers size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">React Native TypeScript Gold Standard</h3>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">
                We specialize in React Native (TypeScript). This allows ambitious founders to launch pristine native iOS and Android apps simultaneously from a single unified codebase, cutting development budgets and maintenance overhead in half.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <h5 className="font-black text-slate-900 uppercase tracking-tight text-base mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-600" size={18} />
                  <span>Why React Native Wins for Startups</span>
                </h5>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  <li>• 60fps buttery-smooth native UI animations</li>
                  <li>• Direct access to device hardware (Bluetooth, Camera, GPS)</li>
                  <li>• Single codebase means bug fixes update both iOS & Android instantly</li>
                  <li>• Huge ecosystem of verified plugins and secure libraries</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <h5 className="font-black text-slate-900 uppercase tracking-tight text-base mb-3 flex items-center gap-2">
                  <ShieldCheck className="text-blue-600" size={18} />
                  <span>Enterprise Reliability</span>
                </h5>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  <li>• Backed by Meta, Microsoft, and Shopify</li>
                  <li>• Strongly typed TypeScript prevents runtime crashes</li>
                  <li>• Seamless Over-The-Air (OTA) updates for urgent hotfixes</li>
                  <li>• Fully compatible with native Swift/Kotlin bridging when needed</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'faq-3': // App Store & Play Store
        return (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/60 border border-blue-200/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">End-to-End Store Submission Guaranteed</h3>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">
                Navigating Apple App Store guidelines and Google Play review policies can be daunting. Dee-Maker handles the entire publication pipeline from end to end so you never have to worry about rejection notices.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">1. Developer Account Provisioning</h5>
                <p className="text-slate-500 font-medium text-sm">We guide you through setting up your Apple Developer Organization account and Google Play Console developer profile.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">2. TestFlight & Internal Testing</h5>
                <p className="text-slate-500 font-medium text-sm">Deploying beta test builds to your stakeholders and early beta testers via Apple TestFlight and Google Play Internal Testing tracks.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">3. Compliance, Metadata & Review Management</h5>
                <p className="text-slate-500 font-medium text-sm">Preparing app store screenshots, promotional banners, privacy policy links, age rating questionnaires, and swiftly handling any Apple/Google review feedback.</p>
              </div>
            </div>
          </div>
        );

      case 'faq-4': // Billing & Payment
        return (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/60 border border-blue-200/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Transparent Milestone-Based Billing</h3>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">
                We believe in absolute financial transparency. You always know exactly what you are paying for with fixed-scope milestone contracts before a single dollar changes hands.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                <div className="text-3xl font-black text-blue-600 mb-2">40%</div>
                <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">Upfront Deposit</h5>
                <p className="text-slate-500 font-medium text-xs">Secures your project slot on the roadmap and initiates architecture design.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                <div className="text-3xl font-black text-blue-600 mb-2">30%</div>
                <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">Beta Milestone</h5>
                <p className="text-slate-500 font-medium text-xs">Payable upon successful interactive prototype and functional feature review.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                <div className="text-3xl font-black text-blue-600 mb-2">30%</div>
                <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">Launch Completion</h5>
                <p className="text-slate-500 font-medium text-xs">Payable upon final App Store approval and full source code handover.</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              {faq.answer}
            </p>
            <p className="text-slate-500 font-medium leading-relaxed">
              Dee-Maker engineering is dedicated to providing high-performance codebases, robust backend security, and seamless deployment workflows for ambitious founders worldwide.
            </p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-white pt-28 pb-32"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={tapScale}
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 mb-10 transition-colors cursor-pointer bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200"
        >
          <ArrowLeft size={16} />
          <span>Back to Overview</span>
        </motion.button>

        {/* Title */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider mb-4 border border-blue-200">
            <Sparkles size={12} />
            <span>Dee-Maker Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight leading-tight">
            {faq.question}
          </h1>
        </div>

        {/* Content Body */}
        <div className="prose prose-slate max-w-none mb-16">
          {renderDetailedContent()}
        </div>

        {/* CTA Box */}
        <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4">
            Ready to Build Your Project?
          </h3>
          <p className="text-slate-300 font-medium max-w-lg mx-auto mb-8 text-sm sm:text-base">
            Let's discuss your timeline, technical architecture, and scope. Book a free 15-minute intro call or submit your project specs now.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={tapScale}
              onClick={onOpenIntake}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all cursor-pointer"
            >
              <span>Start Your Project</span>
              <Send size={15} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={tapScale}
              onClick={onOpenBookCall}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black uppercase tracking-widest text-xs transition-all cursor-pointer"
            >
              <span>Book 15-Min Intro Call</span>
              <PhoneCall size={15} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
