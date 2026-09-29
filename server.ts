import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "data", "db.json");

// Configure Cloudinary from CLOUDINARY_URL (environment or default key)
function configureCloudinary() {
  const rawUrl = process.env.CLOUDINARY_URL || "cloudinary://886141587753616:P-7U8W10vymtAXqwyZnAdVFtiLg@vhbxqrzq";
  const cleanUrl = rawUrl.trim();
  const match = cleanUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (match) {
    cloudinary.config({
      api_key: match[1],
      api_secret: match[2],
      cloud_name: match[3],
      secure: true
    });
    console.log(`[Cloudinary] Configured successfully for cloud_name: ${match[3]}`);
  } else {
    cloudinary.config();
    console.log("[Cloudinary] Configured using standard cloudinary.config()");
  }
}
configureCloudinary();

// Configure multer storage for file uploads (150MB cap for app files, 50MB for media)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 }
});

// Helper to strip non-ASCII characters (e.g. \u200E LTR marks, zero-width spaces) from headers/keys
function sanitizeAscii(str: string | undefined): string {
  if (!str) return '';
  return str.replace(/[^\x20-\x7E]/g, '').trim();
}

// Service Account parser from FIREBASE_SERVICE_ACCOUNT
function getServiceAccountCredentials(): any | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;

  try {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed);
    }
    if (fs.existsSync(trimmed)) {
      return JSON.parse(fs.readFileSync(trimmed, "utf-8"));
    }
    return JSON.parse(trimmed);
  } catch (err) {
    console.error("[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON credentials:", err);
    return null;
  }
}

// Lazy Firebase Admin Initialization for Firestore site data
let firebaseAdminApp: ReturnType<typeof initializeApp> | null = null;
let firestoreDb: ReturnType<typeof getFirestore> | null = null;
let hasLoggedAdminWarning = false;

function getFirebaseAdmin() {
  if (firebaseAdminApp && firestoreDb) {
    return { app: firebaseAdminApp, db: firestoreDb };
  }

  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    if (!hasLoggedAdminWarning) {
      console.warn(
        "[Firebase Admin] FIREBASE_SERVICE_ACCOUNT is not set. Falling back to local data/db.json storage."
      );
      hasLoggedAdminWarning = true;
    }
    return null;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseAdminApp = existingApps[0];
    } else {
      firebaseAdminApp = initializeApp({
        credential: cert(credentials)
      });
    }

    firestoreDb = getFirestore(firebaseAdminApp);
    console.log(`[Firebase Admin] Firestore initialized successfully for project: ${credentials.project_id || 'unknown'}`);
    return { app: firebaseAdminApp, db: firestoreDb };
  } catch (initErr) {
    console.error("[Firebase Admin] Initialization error:", initErr);
    return null;
  }
}

// Helper to determine Cloudinary resource_type
function getCloudinaryResourceType(cleanExt: string, cleanMime: string): "image" | "video" | "raw" {
  const ext = cleanExt.toLowerCase();
  const mime = cleanMime.toLowerCase();

  if (
    ext === ".apk" ||
    ext === ".ipa" ||
    ext === ".zip" ||
    ext === ".bin" ||
    ext === ".tar" ||
    ext === ".gz" ||
    ext === ".7z" ||
    ext === ".rar" ||
    ext === ".pdf" ||
    mime.includes("zip") ||
    mime.includes("android") ||
    mime.includes("apk") ||
    mime.includes("octet-stream")
  ) {
    return "raw";
  }

  if (
    ext === ".mp4" ||
    ext === ".mov" ||
    ext === ".webm" ||
    ext === ".m4v" ||
    ext === ".avi" ||
    mime.startsWith("video/")
  ) {
    return "video";
  }

  if (
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".png" ||
    ext === ".webp" ||
    ext === ".gif" ||
    ext === ".svg" ||
    ext === ".avif" ||
    mime.startsWith("image/")
  ) {
    return "image";
  }

  return "raw";
}

// Delete file from Cloudinary by URL (or public_id)
async function deleteCloudinaryFileFromUrl(fileUrl: string) {
  if (!fileUrl) return;

  try {
    if (fileUrl.includes("cloudinary.com")) {
      const match = fileUrl.match(/\/([^\/]+)\/upload\/(?:v\d+\/)?(.+)$/);
      if (match) {
        const rawType = match[1]; // 'image', 'video', 'raw'
        const resourceType: "image" | "video" | "raw" =
          rawType === "video" ? "video" : rawType === "raw" ? "raw" : "image";

        const pathAfterUpload = match[2].split("?")[0];
        let publicId = pathAfterUpload;
        if (resourceType === "image" || resourceType === "video") {
          const dotIdx = pathAfterUpload.lastIndexOf(".");
          if (dotIdx !== -1) {
            publicId = pathAfterUpload.substring(0, dotIdx);
          }
        }

        const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(`[Cloudinary] Destroyed ${resourceType} (${publicId}):`, res);
      }
    }
  } catch (err) {
    console.error("Error deleting file from Cloudinary:", err);
  }
}

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initial default database state
const defaultDb = {
  about: {
    title: "Independent Mobile & Web App Developer",
    story: "At Dee-Maker Studio, we specialize in designing, building, and deploying custom mobile apps (iOS & Android) and web applications for startups, small businesses, and founders.\n\nOver the past 6 years, we've delivered over 24 production apps — ranging from real-time logistics tools to SaaS platforms and health trackers. Our focus is straightforward: clear communication, rapid prototyping, clean code, and zero technical bloat.\n\nWhen you work with Dee-Maker, you collaborate directly with dedicated software engineers from initial wireframe to App Store launch.",
    yearsExperience: 6,
    appsBuilt: 24,
    skills: ["React Native", "TypeScript", "Node.js", "Express", "Firebase", "PostgreSQL", "React", "Tailwind CSS", "REST & GraphQL APIs", "App Store Deployment"]
  },
  portfolio: [
    {
      id: "port-1",
      title: "FitPulse Health & Workout Tracker",
      category: "iOS & Android",
      description: "A cross-platform mobile app featuring custom workout logging, real-time heart rate graph visualizations, and offline sync.",
      imageUrl: "https://images.unsplash.com/photo-1510519138161-58446230f71b?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      techStack: ["React Native", "TypeScript", "Firebase", "Tailwind"],
      createdAt: "2025-11-10T10:00:00.000Z"
    },
    {
      id: "port-2",
      title: "SwiftLend Peer-to-Peer Rental Portal",
      category: "Web & Mobile Web",
      description: "A full-stack marketplace platform for local tool and equipment rentals with stripe payment integration and automated booking calendars.",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      videoUrl: "",
      techStack: ["React", "Express", "PostgreSQL", "Tailwind CSS"],
      createdAt: "2025-12-04T14:30:00.000Z"
    },
    {
      id: "port-3",
      title: "OmniRoute Fleet Dispatcher",
      category: "Desktop & Web",
      description: "Real-time fleet tracking dashboard used by 15 local delivery dispatchers to assign driver routes and track package status.",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      techStack: ["TypeScript", "Node.js", "WebSockets", "React"],
      createdAt: "2026-02-18T09:15:00.000Z"
    },
    {
      id: "port-4",
      title: "Nourish Table Recipe & Meal Planner",
      category: "iOS App",
      description: "Minimalist iOS app for grocery list generation and weekly meal prep planning with over 10,000 active monthly users.",
      imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
      videoUrl: "",
      techStack: ["React Native", "Redux Toolkit", "Node.js"],
      createdAt: "2026-04-02T11:45:00.000Z"
    }
  ],
  caseStudies: [
    {
      id: "cs-1",
      portfolioId: "port-1",
      title: "FitPulse Health & Workout Tracker",
      client: "FitPulse Health",
      category: "iOS & Android Mobile App",
      summary: "How Dee-Maker built a cross-platform mobile health tracker with offline sync and live biometric telemetry in 5 weeks.",
      problem: "FitPulse had a web MVP that users couldn't bring to the gym due to poor mobile web UI and lack of offline connectivity when working out in basements or low-reception areas.",
      approach: "Built a native-feel React Native mobile application paired with a local SQLite/AsyncStorage sync queue. Designed custom smooth SVG charting for heart rate zones and simplified workout logging to 2 taps per exercise set.",
      outcome: "Successfully launched on iOS App Store and Google Play Store. Reached over 5,000 active users within 60 days with a 4.9-star rating.",
      metrics: ["5,000+ Active Users", "4.9/5 Rating", "5 Weeks to Launch", "100% Offline Capable"],
      imageUrl: "https://images.unsplash.com/photo-1510519138161-58446230f71b?auto=format&fit=crop&w=800&q=80",
      techStack: ["React Native", "TypeScript", "Firebase Auth", "SQLite", "Tailwind"]
    },
    {
      id: "cs-2",
      portfolioId: "port-2",
      title: "SwiftLend Peer-to-Peer Rental Portal",
      client: "SwiftLend Inc.",
      category: "Full-Stack Web Marketplace",
      summary: "Building an automated tool rental marketplace with Stripe Connect escrow and real-time availability calendar.",
      problem: "Equipment owners and contractors were losing deals due to slow manual email bookings and double-booking conflicts.",
      approach: "Engineered a custom React & Node.js marketplace with Stripe Connect automated payouts, instant identity verification, and conflict-free booking calendar constraints.",
      outcome: "Processed over $120,000 in rental equipment volume during the first 90 days following launch.",
      metrics: ["$120k+ Rental Volume", "0 Booking Conflicts", "6-Week Delivery", "Stripe Escrow Integrated"],
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      techStack: ["React", "Node.js", "Express", "PostgreSQL", "Stripe Connect"]
    },
    {
      id: "cs-3",
      portfolioId: "port-3",
      title: "OmniRoute Fleet Dispatcher",
      client: "Vance Logistics",
      category: "Real-Time Fleet Operations Dashboard",
      summary: "Transitioning a regional logistics company from paper dispatch slips to a sub-second WebSocket dashboard.",
      problem: "Dispatchers were spending 3+ hours daily making phone calls to update driver statuses and route changes.",
      approach: "Created a high-density React control room dashboard connected via WebSockets to driver GPS updates with automated route re-calculation and instant SMS dispatch alerts.",
      outcome: "Reduced fleet dispatch delay by 42% and saved dispatchers an estimated 18 hours per week in manual calls.",
      metrics: ["42% Faster Dispatch", "18 Hours/Wk Saved", "15 Active Dispatch Centers", "Sub-200ms Telemetry"],
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      techStack: ["TypeScript", "React", "Node.js", "WebSockets", "Tailwind CSS"]
    }
  ],
  testimonials: [
    {
      id: "test-1",
      clientName: "Marcus Vance",
      company: "Vance Logistics",
      role: "Operations Director",
      quote: "Dee-Maker took our manual paper-dispatch system and built an intuitive web portal in 5 weeks. Our driver efficiency increased immediately.",
      rating: 5
    },
    {
      id: "test-2",
      clientName: "Elena Rostova",
      company: "FitPulse Health",
      role: "Founder & CEO",
      quote: "Working with Dee-Maker felt like having a co-founder CTO. Clear about timelines, caught edge cases early, and launched our iOS app seamlessly.",
      rating: 5
    },
    {
      id: "test-3",
      clientName: "James O'Connor",
      company: "SwiftLend",
      role: "Product Manager",
      quote: "Zero fluff, great communication, and pristine code. Dee-Maker is our go-to studio for every major product feature update.",
      rating: 5
    }
  ],
  faqs: [
    {
      id: "faq-1",
      question: "How does your project pricing work?",
      answer: "I offer fixed-scope milestone quotes for well-defined MVPs and projects, as well as weekly sprint contracts for ongoing app development. Every project includes a detailed scope breakdown before any agreement."
    },
    {
      id: "faq-2",
      question: "What is your typical project turnaround time?",
      answer: "A focused MVP app usually takes 3 to 6 weeks from initial wireframes to test builds. Larger platforms with complex backend infrastructure typically take 8 to 12 weeks."
    },
    {
      id: "faq-3",
      question: "How does the development process work?",
      answer: "1. Scope & Design Sync: We finalize core user flows.\n2. Weekly Sprints: You get a working test build every Friday.\n3. Testing & QA: Rigorous mobile device and browser testing.\n4. Handover & Deployment: App Store submission and server deployment with full source code transfer."
    },
    {
      id: "faq-4",
      question: "Do you assist with App Store and Play Store publishing?",
      answer: "Yes. I handle the developer account setup, test builds (TestFlight / Internal Testing), production submission, and compliance review assets."
    }
  ],
  requests: [
    {
      id: "req-101",
      name: "Sarah Jenkins",
      phone: "+1 (555) 234-5678",
      email: "sarah@brightcafes.com",
      appName: "BrightCafes Mobile Order",
      appDescription: "A mobile ordering app for local coffee shops with loyalty points and curbside pickup notifications.",
      preferredContact: "whatsapp",
      heardFrom: "LinkedIn / Social Media",
      selectedPackage: "Custom Build",
      paymentStatus: "Deposit Paid",
      status: "New",
      aiConfirmationMessage: "Hi Sarah! Dee-Maker team here. I've received your request for the BrightCafes Mobile Order app. Loyalty & curbside ordering sounds like a great concept — I'll review your details and reach out on WhatsApp (+1 555-234-5678) shortly to discuss scope!",
      createdAt: "2026-07-23T16:20:00.000Z",
      notes: "High potential client with 4 local coffee shop locations."
    },
    {
      id: "req-102",
      name: "Daniel Miller",
      phone: "08059264736",
      email: "daniel@apexfit.co",
      appName: "ApexFit Workout Partner",
      appDescription: "Cross-platform workout logger with interval timer and community leaderboards.",
      preferredContact: "email",
      heardFrom: "Google Search",
      selectedPackage: "Simple App / MVP",
      paymentStatus: "Unpaid",
      status: "New",
      aiConfirmationMessage: "Hi Daniel! Thanks for reaching out about ApexFit Workout Partner. I will analyze your feature set and email you with a quote within 24 hours.",
      createdAt: "2026-07-20T10:15:00.000Z",
      notes: "Sitting in New for > 3 days (stale alert test item)."
    }
  ],
  privateFeedback: [
    {
      id: "feed-1",
      name: "Alex Rivera",
      email: "alex.r@techfound.io",
      message: "Loved browsing your portfolio! The fleet dispatch app layout is super clean.",
      createdAt: "2026-07-22T11:00:00.000Z"
    }
  ],
  emailSettings: {
    notifyEmail: "deemakers01@gmail.com",
    enabled: true,
    staleAlertDays: 3,
    logs: [
      "2026-07-23T16:20:00.000Z - Email alert sent for new request 'BrightCafes Mobile Order' from Sarah Jenkins"
    ]
  },
  bookings: [],
  myApps: [],
  pricingTiers: [
    {
      id: "price-1",
      name: "Simple App / MVP",
      tagline: "Perfect for validation",
      price: "$1,200",
      period: "per project",
      features: ["Custom UI Design", "Auth & Database", "App Store Submission", "Push Notifications"],
      turnaround: "3-4 Weeks",
      bestFor: "Startups & Solopreneurs",
      category: "app"
    },
    {
      id: "price-2",
      name: "Standard Full-Stack",
      tagline: "The production-ready choice",
      price: "$2,800",
      period: "per project",
      popular: true,
      features: ["Everything in MVP", "Admin Dashboard", "Payment Integration", "Analytics API"],
      turnaround: "6-8 Weeks",
      bestFor: "Growing Businesses",
      category: "app"
    },
    {
      id: "price-3",
      name: "Custom Enterprise",
      tagline: "Maximum scale & performance",
      price: "$5,500+",
      period: "per project",
      features: ["Everything in Standard", "Complex Backend / Logic", "Multi-role Access Control", "3-Month Free Support"],
      turnaround: "10-12 Weeks",
      bestFor: "Complex Platforms",
      category: "app"
    }
  ]
};

// Helper functions for reading/writing DB with Firestore persistence & local fallback cache
let cachedDb: any = null;
let isDbSeeded = false;

// Read database from Firestore modular collections with local sync
async function getDb(): Promise<any> {
  const admin = getFirebaseAdmin();

  if (admin?.db) {
    try {
      // Aggregate data from all modular collections
      const [
        aboutDoc,
        portfolioSnap,
        caseStudiesSnap,
        testimonialsSnap,
        faqsSnap,
        myAppsSnap,
        pricingSnap,
        requestsSnap,
        feedbackSnap,
        settingsDoc,
        questionsSnap,
        siteDataDoc,
        bookingsSnap
      ] = await Promise.all([
        admin.db.collection("about").doc("main").get(),
        admin.db.collection("portfolio").orderBy("createdAt", "desc").get(),
        admin.db.collection("case_studies").get(),
        admin.db.collection("testimonials").get(),
        admin.db.collection("faqs").get(),
        admin.db.collection("my_apps").get(),
        admin.db.collection("pricing_tiers").get(),
        admin.db.collection("requests").orderBy("createdAt", "desc").get(),
        admin.db.collection("feedback").orderBy("createdAt", "desc").get(),
        admin.db.collection("settings").doc("email").get(),
        admin.db.collection("intake_questions").get(),
        admin.db.collection("siteData").doc("main").get(),
        admin.db.collection("call_bookings").orderBy("createdAt", "desc").get().catch(() => ({ docs: [] } as any))
      ]);

      const siteData = siteDataDoc?.exists ? siteDataDoc.data() : {};
      const aboutObj: any = aboutDoc.exists ? aboutDoc.data() : { ...defaultDb.about };
      if (siteData?.heroVideoUrl !== undefined) {
        aboutObj.heroVideoUrl = siteData.heroVideoUrl;
      }

      const firestoreData = {
        about: aboutObj,
        siteData: siteData,
        portfolio: portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        caseStudies: caseStudiesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        testimonials: testimonialsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        faqs: faqsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        myApps: myAppsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        pricingTiers: pricingSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        requests: requestsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        bookings: bookingsSnap?.docs ? bookingsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) : [],
        privateFeedback: feedbackSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        emailSettings: settingsDoc.exists ? settingsDoc.data() : defaultDb.emailSettings,
        intakeQuestions: questionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      };

      cachedDb = { ...defaultDb, ...firestoreData };
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(cachedDb, null, 2), "utf-8");
      } catch (_) {}
      return cachedDb;
    } catch (fsErr) {
      console.warn("[Firestore] Modular collections read error (falling back to local cache):", fsErr);
    }
  }

  // Fallback to in-memory cache or local disk replica
  if (cachedDb) return cachedDb;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const loaded = JSON.parse(data);
      cachedDb = { ...defaultDb, ...loaded };
      return cachedDb;
    }
  } catch (err) {
    console.error("Error reading fallback local database file:", err);
  }

  cachedDb = { ...defaultDb };
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cachedDb, null, 2), "utf-8");
  } catch (_) {}
  return cachedDb;
}

// Write database to Firestore - Since the client now handles most writes directly,
// we only need this for the aggregated saveDb calls if any remain.
// We'll update saveDb to throw an error or handle it carefully.
async function saveDb(data: any): Promise<void> {
  cachedDb = data;

  // Local backup replica write
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local backup database file:", err);
  }
  
  // Note: Modular writing logic is omitted here for brevity as client does direct writes now.
  // In a full migration, we would update individual endpoints to write to specific collections.
}

// Backward compatibility helper
function readDb() {
  return cachedDb || defaultDb;
}

function writeDb(data: any) {
  saveDb(data).catch((err) => console.error("Async saveDb error:", err));
}

// Initialize AI
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// HTML escape helper
function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Resend Email Notification Helper
async function sendNotificationEmail(db: any, subject: string, html: string): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = (db.emailSettings?.notifyEmail || db.emailSettings?.businessEmail || "").trim();

  // If emailSettings is explicitly disabled
  if (db.emailSettings && db.emailSettings.enabled === false) {
    const logMsg = `${new Date().toISOString()} - Email not sent: notifications disabled in settings`;
    console.log(`[Email] ${logMsg}`);
    if (!db.emailSettings.logs) db.emailSettings.logs = [];
    db.emailSettings.logs.unshift(logMsg);
    return "disabled";
  }

  const isPlaceholder = !recipient || recipient === "yourbusiness@email.com" || !recipient.includes("@");
  if (!apiKey || isPlaceholder) {
    const logMsg = `${new Date().toISOString()} - Email not sent: not configured`;
    console.log(`[Email] ${logMsg}`);
    if (!db.emailSettings) db.emailSettings = { enabled: true, logs: [] };
    if (!db.emailSettings.logs) db.emailSettings.logs = [];
    db.emailSettings.logs.unshift(logMsg);

    const admin = getFirebaseAdmin();
    if (admin?.db) {
      try {
        await admin.db.collection("settings").doc("email").set(db.emailSettings, { merge: true });
      } catch (_) {}
    }
    return "not_configured";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Dee-Maker <onboarding@resend.dev>",
        to: [recipient],
        subject,
        html
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      let reason = errText;
      try {
        const parsed = JSON.parse(errText);
        reason = parsed.message || parsed.error || errText;
      } catch (_) {}
      const logMsg = `${new Date().toISOString()} - Email failed: ${reason}`;
      console.error(`[Email] ${logMsg}`);
      if (!db.emailSettings) db.emailSettings = { enabled: true, logs: [] };
      if (!db.emailSettings.logs) db.emailSettings.logs = [];
      db.emailSettings.logs.unshift(logMsg);

      const admin = getFirebaseAdmin();
      if (admin?.db) {
        try {
          await admin.db.collection("settings").doc("email").set(db.emailSettings, { merge: true });
        } catch (_) {}
      }
      return "failed";
    }

    const logMsg = `${new Date().toISOString()} - Email sent to ${recipient}`;
    console.log(`[Email] ${logMsg}`);
    if (!db.emailSettings) db.emailSettings = { enabled: true, logs: [] };
    if (!db.emailSettings.logs) db.emailSettings.logs = [];
    db.emailSettings.logs.unshift(logMsg);

    const admin = getFirebaseAdmin();
    if (admin?.db) {
      try {
        await admin.db.collection("settings").doc("email").set(db.emailSettings, { merge: true });
      } catch (_) {}
    }
    return "sent";
  } catch (err: any) {
    const reason = err?.message || "network error";
    const logMsg = `${new Date().toISOString()} - Email failed: ${reason}`;
    console.error(`[Email] ${logMsg}`);
    if (!db.emailSettings) db.emailSettings = { enabled: true, logs: [] };
    if (!db.emailSettings.logs) db.emailSettings.logs = [];
    db.emailSettings.logs.unshift(logMsg);

    const admin = getFirebaseAdmin();
    if (admin?.db) {
      try {
        await admin.db.collection("settings").doc("email").set(db.emailSettings, { merge: true });
      } catch (_) {}
    }
    return "failed";
  }
}

// Format Email HTML for Call Bookings
function formatCallBookingEmailHtml(booking: {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  topic?: string;
  createdAt: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0b1020; color: #ffffff; padding: 24px; text-align: left; }
    .header h2 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; }
    .header p { margin: 0; font-size: 13px; color: #94a3b8; }
    .body { padding: 24px; }
    .row { display: flex; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
    .label { width: 140px; font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { flex: 1; font-size: 14px; color: #0f172a; font-weight: 600; }
    .highlight { color: #0284c7; font-weight: 800; }
    .topic-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 16px; font-size: 13px; color: #334155; line-height: 1.5; }
    .footer { text-align: center; padding: 16px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>New 15-Min Intro Call Request</h2>
      <p>15-minute consultation requested on Dee-Maker Studio</p>
    </div>
    <div class="body">
      <div class="row">
        <div class="label">Client Name</div>
        <div class="value">${escapeHtml(booking.name)}</div>
      </div>
      <div class="row">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${escapeHtml(booking.email)}" style="color:#0284c7;text-decoration:none;">${escapeHtml(booking.email)}</a></div>
      </div>
      <div class="row">
        <div class="label">Phone / WhatsApp</div>
        <div class="value">${booking.phone ? escapeHtml(booking.phone) : '<em>Not provided</em>'}</div>
      </div>
      <div class="row">
        <div class="label">Reserved Date</div>
        <div class="value highlight">${escapeHtml(booking.date)}</div>
      </div>
      <div class="row">
        <div class="label">Reserved Time</div>
        <div class="value highlight">${escapeHtml(booking.time)} (WAT)</div>
      </div>
      <div class="row">
        <div class="label">Submitted At</div>
        <div class="value">${new Date(booking.createdAt).toLocaleString()}</div>
      </div>
      <div class="topic-box">
        <strong>Discussion Topic / Concept:</strong><br/>
        ${escapeHtml(booking.topic || 'App Architecture & Scope Overview')}
      </div>
    </div>
    <div class="footer">
      Dee-Maker Studio Notification System
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Format Email HTML for Project Intake Requests
function formatProjectRequestEmailHtml(reqItem: any): string {
  const qAns = reqItem.questionnaireAnswers || [];
  let questionnaireRows = "";
  if (Array.isArray(qAns) && qAns.length > 0) {
    const valid = qAns.filter((q: any) => {
      const val = Array.isArray(q.answer) ? q.answer.join(", ") : q.answer;
      return val && val !== "Not specified" && String(val).trim() !== "";
    });
    if (valid.length > 0) {
      questionnaireRows = `
        <div style="margin-top: 20px;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">Questionnaire Responses</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${valid.map((q: any) => {
              const val = Array.isArray(q.answer) ? q.answer.join(", ") : q.answer;
              return `
                <tr>
                  <td style="padding: 8px 0; font-weight: 700; color: #475569; width: 45%; vertical-align: top;">${escapeHtml(q.label || q.questionId || 'Question')}</td>
                  <td style="padding: 8px 0; color: #0f172a; vertical-align: top;">${escapeHtml(String(val))}</td>
                </tr>
              `;
            }).join("")}
          </table>
        </div>
      `;
    }
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0b1020; color: #ffffff; padding: 24px; text-align: left; }
    .header h2 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; }
    .header p { margin: 0; font-size: 13px; color: #94a3b8; }
    .body { padding: 24px; }
    .row { display: flex; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
    .label { width: 160px; font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { flex: 1; font-size: 14px; color: #0f172a; font-weight: 600; }
    .desc-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 16px; font-size: 13px; color: #334155; line-height: 1.5; }
    .footer { text-align: center; padding: 16px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>New Project Request</h2>
      <p>Project inquiry received on Dee-Maker Studio</p>
    </div>
    <div class="body">
      <div class="row">
        <div class="label">Project / App Name</div>
        <div class="value" style="color:#0284c7;font-weight:800;">${escapeHtml(reqItem.appName)}</div>
      </div>
      <div class="row">
        <div class="label">Client Name</div>
        <div class="value">${escapeHtml(reqItem.name)}</div>
      </div>
      <div class="row">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${escapeHtml(reqItem.email)}" style="color:#0284c7;text-decoration:none;">${escapeHtml(reqItem.email)}</a></div>
      </div>
      <div class="row">
        <div class="label">Phone / WhatsApp</div>
        <div class="value">${reqItem.phone ? escapeHtml(reqItem.phone) : '<em>Not provided</em>'}</div>
      </div>
      <div class="row">
        <div class="label">Preferred Contact</div>
        <div class="value">${escapeHtml(reqItem.preferredContact || 'email')}</div>
      </div>
      <div class="row">
        <div class="label">Package Tier</div>
        <div class="value">${escapeHtml(reqItem.selectedPackage || 'Custom Build')}</div>
      </div>
      <div class="row">
        <div class="label">Project Type</div>
        <div class="value">${escapeHtml(reqItem.projectType || 'app')}</div>
      </div>
      <div class="row">
        <div class="label">Heard From</div>
        <div class="value">${escapeHtml(reqItem.heardFrom || 'Unspecified')}</div>
      </div>
      <div class="desc-box">
        <strong>Description / Scope:</strong><br/>
        ${escapeHtml(reqItem.appDescription || '').replace(/\n/g, '<br/>')}
      </div>
      ${questionnaireRows}
    </div>
    <div class="footer">
      Dee-Maker Studio Notification System
    </div>
  </div>
</body>
</html>
  `.trim();
}


async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Get public data (portfolio, about, testimonials, faqs, caseStudies, intakeQuestions)
  app.get("/api/data", async (req, res) => {
    console.log(`[API] GET /api/data requested from ${req.ip}`);
    try {
      const db = await getDb();
      res.json({
        about: db.about,
        portfolio: db.portfolio || [],
        caseStudies: db.caseStudies || [],
        myApps: db.myApps || [],
        pricingTiers: db.pricingTiers || [],
        testimonials: db.testimonials || [],
        faqs: db.faqs || [],
        intakeQuestions: db.intakeQuestions || [],
        whatsappNumber: db.siteData?.whatsappNumber || db.emailSettings?.whatsappNumber || "2349070392028",
        businessEmail: db.emailSettings?.businessEmail || db.emailSettings?.notifyEmail || "deemakers01@gmail.com"
      });
    } catch (err: any) {
      console.error("Error in GET /api/data:", err);
      res.status(500).json({ error: "Failed to fetch public data." });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 2. Submit Client Intake Request (Home Form)
  app.post("/api/requests", async (req, res) => {
    try {
      const { name, phone, email, appName, appDescription, preferredContact, heardFrom, selectedPackage, projectType, answers, questionnaireAnswers } = req.body;

      if (!name || !email || !appName || !appDescription) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const db = await getDb();
      let aiMessage = "";

      const ai = getAiClient();
      if (ai) {
        try {
          const channel = preferredContact === "whatsapp" ? `WhatsApp (${phone || email})` : `Email (${email})`;
          const prompt = `You are the engineering team at Dee-Maker Studio.
A client named "${name}" just submitted a project inquiry for an app called "${appName}".
Selected tier package: "${selectedPackage || 'Not specified'}".
How they heard about Dee-Maker: "${heardFrom || 'Not specified'}".
App description: "${appDescription}".
Preferred follow-up channel: ${channel}.

Generate a short, warm, professional confirmation message (2 to 3 sentences max) to display directly to ${name} on screen.
Requirements:
1. Specifically acknowledge their app concept ("${appName}") in a natural way.
2. Confirm that Dee-Maker has received their request and will follow up via ${preferredContact === "whatsapp" ? "WhatsApp" : "email"} shortly.
3. Keep the tone plain, encouraging, direct, and personal. Do NOT use buzzwords, corporate jargon, or filler marketing phrases.`;

          const modelName = process.env.GEMINI_MODEL || "gemini-3.7-flash";
          const interaction = await ai.interactions.create({
            model: modelName,
            input: prompt
          });

          aiMessage = interaction.output_text || "";
        } catch (aiErr) {
          console.error("Gemini API call failed:", aiErr);
        }
      }

      // Fallback confirmation message if AI unavailable
      if (!aiMessage) {
        aiMessage = `Hi ${name}! Thank you for reaching out to Dee-Maker about "${appName}". I've received your request and will review the details. I will follow up with you via ${preferredContact === "whatsapp" ? "WhatsApp" : "email"} shortly.`;
      }

      const newRequest = {
        id: "req-" + Date.now(),
        name,
        phone: phone || "",
        email,
        appName,
        appDescription,
        preferredContact: preferredContact || "email",
        projectType: projectType || "app",
        heardFrom: heardFrom || "Direct / Unspecified",
        selectedPackage: selectedPackage || "Custom Build",
        paymentStatus: "Unpaid",
        status: "New",
        aiConfirmationMessage: aiMessage,
        createdAt: new Date().toISOString(),
        notes: "",
        answers: answers || {},
        questionnaireAnswers: questionnaireAnswers || []
      };

      if (!db.requests) db.requests = [];
      db.requests.unshift(newRequest);

      // Save to Firestore if available
      const admin = getFirebaseAdmin();
      if (admin?.db) {
        try {
          await admin.db.collection("requests").doc(newRequest.id).set(newRequest);
        } catch (fsErr) {
          console.warn("[Firestore] Request write warning:", fsErr);
        }
      }

      // Real email notification via Resend REST API
      const emailSubject = `New project request — ${name} — ${appName}`;
      const emailHtml = formatProjectRequestEmailHtml(newRequest);
      await sendNotificationEmail(db, emailSubject, emailHtml);

      await saveDb(db);

      res.json({
        success: true,
        confirmationMessage: aiMessage,
        request: newRequest
      });
    } catch (err: any) {
      console.error("Error creating request:", err);
      res.status(500).json({ error: "Failed to submit project request." });
    }
  });

  // Submit 15-Minute Intro Call Booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const { name, email, phone, date, time, topic } = req.body;

      if (!name || !email || !date || !time) {
        return res.status(400).json({ error: "Name, email, date, and time are required." });
      }

      const db = await getDb();
      const newBooking = {
        id: "call-" + Date.now(),
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : "",
        date: String(date).trim(),
        time: String(time).trim(),
        topic: topic ? String(topic).trim() : "",
        status: "New",
        createdAt: new Date().toISOString()
      };

      if (!db.bookings) db.bookings = [];
      db.bookings.unshift(newBooking);

      // Save to Firestore if available
      const admin = getFirebaseAdmin();
      if (admin?.db) {
        try {
          await admin.db.collection("call_bookings").doc(newBooking.id).set(newBooking);
        } catch (fsErr) {
          console.warn("[Firestore] call_booking write warning:", fsErr);
        }
      }

      // Real email notification via Resend REST API
      const emailSubject = `New call request — ${newBooking.name} — ${newBooking.date} ${newBooking.time}`;
      const emailHtml = formatCallBookingEmailHtml(newBooking);
      await sendNotificationEmail(db, emailSubject, emailHtml);

      await saveDb(db);

      return res.json({
        success: true,
        booking: newBooking
      });
    } catch (err: any) {
      console.error("Error creating booking:", err);
      return res.status(500).json({ error: "Failed to submit call booking." });
    }
  });


  // 3. Submit Private Site Feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const { name, email, message, rating } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required." });
      }

      const db = await getDb();
      const feedback = {
        id: "feed-" + Date.now(),
        name,
        email,
        message,
        rating: rating || 5,
        createdAt: new Date().toISOString()
      };

      if (!db.privateFeedback) db.privateFeedback = [];
      db.privateFeedback.unshift(feedback);
      await saveDb(db);

      res.json({ success: true, feedback });
    } catch (err) {
      res.status(500).json({ error: "Failed to submit feedback." });
    }
  });

  // 4. Producer Verification
  app.post("/api/producer/verify", (req, res) => {
    const { passcode } = req.body;
    const adminPasscode = process.env.PRODUCER_PASSCODE || "web001";
    if (passcode === adminPasscode) {
      return res.json({ success: true, token: "producer-authorized-" + adminPasscode });
    }
    return res.status(401).json({ success: false, error: "Invalid passcode" });
  });

  // 5. Producer: Get All Admin Data (Requests, Feedback, Email Logs)
  app.get("/api/producer/full-data", async (req, res) => {
    try {
      const db = await getDb();
      res.json(db);
    } catch (err: any) {
      console.error("Error in GET /api/producer/full-data:", err);
      res.status(500).json({ error: "Failed to fetch admin data." });
    }
  });

  // 6. Producer: Update Request Status / Notes / Payment Status
  app.patch("/api/producer/requests/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const { status, notes, paymentStatus } = req.body;

      const reqItem = (db.requests || []).find((r: any) => r.id === id);
      if (!reqItem) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (status) reqItem.status = status;
      if (notes !== undefined) reqItem.notes = notes;
      if (paymentStatus) reqItem.paymentStatus = paymentStatus;

      await saveDb(db);
      res.json({ success: true, request: reqItem });
    } catch (err: any) {
      console.error("Error in PATCH /api/producer/requests/:id:", err);
      res.status(500).json({ error: "Failed to update request." });
    }
  });

  // Delete Request
  app.delete("/api/producer/requests/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      db.requests = (db.requests || []).filter((r: any) => r.id !== id);
      await saveDb(db);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error in DELETE /api/producer/requests/:id:", err);
      res.status(500).json({ error: "Failed to delete request." });
    }
  });

  // 6b. Producer: Get All Call Bookings
  app.get("/api/producer/bookings", async (req, res) => {
    try {
      const db = await getDb();
      res.json({ success: true, bookings: db.bookings || [] });
    } catch (err: any) {
      console.error("Error in GET /api/producer/bookings:", err);
      res.status(500).json({ error: "Failed to fetch bookings." });
    }
  });

  // Producer: Update Call Booking Status / Details
  app.patch("/api/producer/bookings/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const { status, topic, date, time } = req.body;

      const booking = (db.bookings || []).find((b: any) => b.id === id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (status) booking.status = status;
      if (topic !== undefined) booking.topic = topic;
      if (date) booking.date = date;
      if (time) booking.time = time;

      const admin = getFirebaseAdmin();
      if (admin?.db) {
        try {
          await admin.db.collection("call_bookings").doc(id).set(booking, { merge: true });
        } catch (fsErr) {
          console.warn("[Firestore] Booking update warning:", fsErr);
        }
      }

      await saveDb(db);
      res.json({ success: true, booking });
    } catch (err: any) {
      console.error("Error in PATCH /api/producer/bookings/:id:", err);
      res.status(500).json({ error: "Failed to update booking." });
    }
  });

  // Producer: Delete Call Booking
  app.delete("/api/producer/bookings/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;

      db.bookings = (db.bookings || []).filter((b: any) => b.id !== id);

      const admin = getFirebaseAdmin();
      if (admin?.db) {
        try {
          await admin.db.collection("call_bookings").doc(id).delete();
        } catch (fsErr) {
          console.warn("[Firestore] Booking delete warning:", fsErr);
        }
      }

      await saveDb(db);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error in DELETE /api/producer/bookings/:id:", err);
      res.status(500).json({ error: "Failed to delete booking." });
    }
  });


// Safe MIME type extension mapping
const MIME_EXTENSION_MAP: Record<string, string> = {
  // Images
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'image/bmp': '.bmp',
  'image/tiff': '.tiff',
  'image/heic': '.heic',
  'image/heif': '.heif',
  // Videos
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
  'video/x-matroska': '.mkv',
  'video/mp2t': '.ts',
  'video/3gpp': '.3gp',
  'video/3gpp2': '.3g2',
  'video/x-m4v': '.m4v',
  // App Installer Packages & Archives
  'application/vnd.android.package-archive': '.apk',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'application/x-zip': '.zip'
};

function getExtensionFromMimeType(mimetype: string, originalname?: string): string {
  const cleanMime = mimetype ? mimetype.toLowerCase().trim() : '';
  const cleanOrig = originalname ? originalname.toLowerCase().trim() : '';

  // Priority to recognized app installer extensions from original file name
  if (cleanOrig.endsWith('.apk')) return '.apk';
  if (cleanOrig.endsWith('.ipa')) return '.ipa';
  if (cleanOrig.endsWith('.zip')) return '.zip';

  if (cleanMime && MIME_EXTENSION_MAP[cleanMime]) {
    return MIME_EXTENSION_MAP[cleanMime];
  }
  if (cleanMime.startsWith("image/")) {
    return ".jpg";
  }
  if (cleanMime.startsWith("video/")) {
    return ".mp4";
  }
  if (cleanMime.includes("android") || cleanMime.includes("apk")) {
    return ".apk";
  }
  if (cleanMime.includes("zip")) {
    return ".zip";
  }
  if (cleanOrig.endsWith('.png')) return '.png';
  if (cleanOrig.endsWith('.jpg') || cleanOrig.endsWith('.jpeg')) return '.jpg';
  if (cleanOrig.endsWith('.webp')) return '.webp';
  if (cleanOrig.endsWith('.mp4')) return '.mp4';
  if (cleanOrig.endsWith('.mov')) return '.mov';

  return ".bin";
}

// Upload buffer helper for Cloudinary
function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    resource_type: "image" | "video" | "raw";
    public_id?: string;
  }
): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

  // 7. Producer File Upload to Cloudinary
  app.post("/api/producer/upload", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size exceeds the 150MB maximum upload limit." });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message || "File upload error." });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file was uploaded." });
      }

      // Sanitize mimetype to clean ASCII
      const rawMime = sanitizeAscii(req.file.mimetype || "");
      const cleanOrigName = sanitizeAscii(req.file.originalname || "");
      
      // Determine file extension
      const fileExt = getExtensionFromMimeType(rawMime, cleanOrigName);
      const isAppFile = fileExt === '.apk' || fileExt === '.ipa' || fileExt === '.zip';

      // Enforce 150MB for app files and 50MB for image/video media
      const maxAllowedSize = isAppFile ? 150 * 1024 * 1024 : 50 * 1024 * 1024;
      if (req.file.size > maxAllowedSize) {
        return res.status(400).json({
          error: `File size exceeds the ${isAppFile ? '150MB' : '50MB'} limit for ${isAppFile ? 'app package builds' : 'images and videos'}.`
        });
      }

      const resourceType = getCloudinaryResourceType(fileExt, rawMime);

      // Unique public ID base (Cloudinary blocks explicit '.apk' / '.ipa' in public_id)
      const parsedBase = path.parse(cleanOrigName || "file").name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30) || "asset";
      const randomSuffix = crypto.randomBytes(6).toString("hex");
      const publicId = `${parsedBase}_${randomSuffix}`;

      let uploadResult: any;
      try {
        uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: "dee-maker-uploads",
          resource_type: resourceType,
          public_id: publicId
        });
      } catch (cloudErr: any) {
        console.error("Cloudinary upload execution error:", cloudErr);
        return res.status(500).json({
          error: cloudErr?.message || "Failed to upload file to Cloudinary."
        });
      }

      return res.json({
        success: true,
        url: uploadResult.secure_url,
        filePath: uploadResult.public_id,
        fileName: cleanOrigName || `${publicId}${fileExt}`,
        resourceType: uploadResult.resource_type
      });
    } catch (err: any) {
      console.error("Upload handler error:", err);
      return res.status(500).json({ error: err.message || "Internal error during file upload." });
    }
  });

  // 8. Producer CRUD: Portfolio
  app.post("/api/producer/portfolio", async (req, res) => {
    try {
      const db = await getDb();
      const newItem = {
        id: "port-" + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      if (!db.portfolio) db.portfolio = [];
      db.portfolio.unshift(newItem);
      await saveDb(db);
      res.json({ success: true, item: newItem });
    } catch (err: any) {
      console.error("Error in POST /api/producer/portfolio:", err);
      res.status(500).json({ error: "Failed to create portfolio item." });
    }
  });

  app.put("/api/producer/portfolio/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const index = (db.portfolio || []).findIndex((p: any) => p.id === id);
      if (index === -1) return res.status(404).json({ error: "Item not found" });

      const oldItem = db.portfolio[index];
      if (req.body.imageUrl !== undefined && oldItem.imageUrl && oldItem.imageUrl !== req.body.imageUrl) {
        await deleteCloudinaryFileFromUrl(oldItem.imageUrl);
      }
      if (req.body.videoUrl !== undefined && oldItem.videoUrl && oldItem.videoUrl !== req.body.videoUrl) {
        await deleteCloudinaryFileFromUrl(oldItem.videoUrl);
      }
      if (req.body.downloadUrl !== undefined && oldItem.downloadUrl && oldItem.downloadUrl !== req.body.downloadUrl) {
        await deleteCloudinaryFileFromUrl(oldItem.downloadUrl);
      }

      db.portfolio[index] = { ...db.portfolio[index], ...req.body };
      await saveDb(db);
      res.json({ success: true, item: db.portfolio[index] });
    } catch (err: any) {
      console.error("Error in PUT /api/producer/portfolio/:id:", err);
      res.status(500).json({ error: "Failed to update portfolio item." });
    }
  });

  app.delete("/api/producer/portfolio/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const itemToDelete = (db.portfolio || []).find((p: any) => p.id === id);

      if (itemToDelete) {
        if (itemToDelete.imageUrl) {
          await deleteCloudinaryFileFromUrl(itemToDelete.imageUrl);
        }
        if (itemToDelete.videoUrl) {
          await deleteCloudinaryFileFromUrl(itemToDelete.videoUrl);
        }
        if (itemToDelete.downloadUrl) {
          await deleteCloudinaryFileFromUrl(itemToDelete.downloadUrl);
        }
      }

      db.portfolio = (db.portfolio || []).filter((p: any) => p.id !== id);
      await saveDb(db);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error in DELETE /api/producer/portfolio/:id:", err);
      res.status(500).json({ error: "Failed to delete portfolio item." });
    }
  });

  // 8. Producer: Update About Story
  app.put("/api/producer/about", async (req, res) => {
    try {
      const db = await getDb();
      db.about = { ...db.about, ...req.body };
      await saveDb(db);
      res.json({ success: true, about: db.about });
    } catch (err: any) {
      console.error("Error in PUT /api/producer/about:", err);
      res.status(500).json({ error: "Failed to update about details." });
    }
  });

  // 9. Producer CRUD: Testimonials
  app.post("/api/producer/testimonials", async (req, res) => {
    try {
      const db = await getDb();
      const newItem = {
        id: "test-" + Date.now(),
        ...req.body
      };
      if (!db.testimonials) db.testimonials = [];
      db.testimonials.unshift(newItem);
      await saveDb(db);
      res.json({ success: true, item: newItem });
    } catch (err: any) {
      console.error("Error in POST /api/producer/testimonials:", err);
      res.status(500).json({ error: "Failed to create testimonial." });
    }
  });

  app.put("/api/producer/testimonials/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const index = (db.testimonials || []).findIndex((t: any) => t.id === id);
      if (index === -1) return res.status(404).json({ error: "Testimonial not found" });

      db.testimonials[index] = { ...db.testimonials[index], ...req.body };
      await saveDb(db);
      res.json({ success: true, item: db.testimonials[index] });
    } catch (err: any) {
      console.error("Error in PUT /api/producer/testimonials/:id:", err);
      res.status(500).json({ error: "Failed to update testimonial." });
    }
  });

  app.delete("/api/producer/testimonials/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      db.testimonials = (db.testimonials || []).filter((t: any) => t.id !== id);
      await saveDb(db);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error in DELETE /api/producer/testimonials/:id:", err);
      res.status(500).json({ error: "Failed to delete testimonial." });
    }
  });

  // 10. Producer CRUD: FAQs
  app.post("/api/producer/faqs", async (req, res) => {
    try {
      const db = await getDb();
      const newItem = {
        id: "faq-" + Date.now(),
        ...req.body
      };
      if (!db.faqs) db.faqs = [];
      db.faqs.push(newItem);
      await saveDb(db);
      res.json({ success: true, item: newItem });
    } catch (err: any) {
      console.error("Error in POST /api/producer/faqs:", err);
      res.status(500).json({ error: "Failed to create FAQ." });
    }
  });

  app.put("/api/producer/faqs/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const index = (db.faqs || []).findIndex((f: any) => f.id === id);
      if (index === -1) return res.status(404).json({ error: "FAQ not found" });

      db.faqs[index] = { ...db.faqs[index], ...req.body };
      await saveDb(db);
      res.json({ success: true, item: db.faqs[index] });
    } catch (err: any) {
      console.error("Error in PUT /api/producer/faqs/:id:", err);
      res.status(500).json({ error: "Failed to update FAQ." });
    }
  });

  app.delete("/api/producer/faqs/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      db.faqs = (db.faqs || []).filter((f: any) => f.id !== id);
      await saveDb(db);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error in DELETE /api/producer/faqs/:id:", err);
      res.status(500).json({ error: "Failed to delete FAQ." });
    }
  });

  // 11. Producer: Email Settings Update
  app.put("/api/producer/email-settings", async (req, res) => {
    try {
      const db = await getDb();
      db.emailSettings = { ...db.emailSettings, ...req.body };
      await saveDb(db);
      res.json({ success: true, emailSettings: db.emailSettings });
    } catch (err: any) {
      console.error("Error in PUT /api/producer/email-settings:", err);
      res.status(500).json({ error: "Failed to update email settings." });
    }
  });

  // 12. Producer CRUD: My Apps
  app.post("/api/producer/my-apps", async (req, res) => {
    try {
      const db = await getDb();
      const newItem = {
        id: "myapp-" + Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!db.myApps) db.myApps = [];
      db.myApps.unshift(newItem);
      await saveDb(db);
      res.json({ success: true, item: newItem });
    } catch (err: any) {
      console.error("Error in POST /api/producer/my-apps:", err);
      res.status(500).json({ error: "Failed to create app entry." });
    }
  });

  app.put("/api/producer/my-apps/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const index = (db.myApps || []).findIndex((a: any) => a.id === id);
      if (index === -1) return res.status(404).json({ error: "App entry not found" });

      const oldItem = db.myApps[index];
      // Cleanup old files if they were replaced
      if (req.body.downloadUrl !== undefined && oldItem.downloadUrl && oldItem.downloadUrl !== req.body.downloadUrl) {
        await deleteCloudinaryFileFromUrl(oldItem.downloadUrl);
      }
      if (req.body.images !== undefined && Array.isArray(oldItem.images)) {
        const removedImages = oldItem.images.filter((img: string) => !req.body.images.includes(img));
        for (const img of removedImages) {
          await deleteCloudinaryFileFromUrl(img);
        }
      }

      db.myApps[index] = { 
        ...db.myApps[index], 
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      await saveDb(db);
      res.json({ success: true, item: db.myApps[index] });
    } catch (err: any) {
      console.error("Error in PUT /api/producer/my-apps/:id:", err);
      res.status(500).json({ error: "Failed to update app entry." });
    }
  });

  app.delete("/api/producer/my-apps/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const itemToDelete = (db.myApps || []).find((a: any) => a.id === id);

      if (itemToDelete) {
        if (itemToDelete.downloadUrl) {
          await deleteCloudinaryFileFromUrl(itemToDelete.downloadUrl);
        }
        if (Array.isArray(itemToDelete.images)) {
          for (const img of itemToDelete.images) {
            await deleteCloudinaryFileFromUrl(img);
          }
        }
      }

      db.myApps = (db.myApps || []).filter((a: any) => a.id !== id);
      await saveDb(db);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error in DELETE /api/producer/my-apps/:id:", err);
      res.status(500).json({ error: "Failed to delete app entry." });
    }
  });

  // 13. Producer CRUD: Pricing Tiers
  app.post("/api/producer/pricing", async (req, res) => {
    try {
      const db = await getDb();
      const newItem = {
        id: "price-" + Date.now(),
        ...req.body
      };
      if (!db.pricingTiers) db.pricingTiers = [];
      db.pricingTiers.push(newItem);
      await saveDb(db);
      res.json({ success: true, item: newItem });
    } catch (err: any) {
      console.error("Error in POST /api/producer/pricing:", err);
      res.status(500).json({ error: "Failed to create pricing tier." });
    }
  });

  app.put("/api/producer/pricing/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const index = (db.pricingTiers || []).findIndex((p: any) => p.id === id);
      if (index === -1) return res.status(404).json({ error: "Pricing tier not found" });

      const oldItem = db.pricingTiers[index];
      if (req.body.imageUrl !== undefined && oldItem.imageUrl && oldItem.imageUrl !== req.body.imageUrl) {
        await deleteCloudinaryFileFromUrl(oldItem.imageUrl);
      }

      db.pricingTiers[index] = { ...db.pricingTiers[index], ...req.body };
      await saveDb(db);
      res.json({ success: true, item: db.pricingTiers[index] });
    } catch (err: any) {
      console.error("Error in PUT /api/producer/pricing/:id:", err);
      res.status(500).json({ error: "Failed to update pricing tier." });
    }
  });

  app.delete("/api/producer/pricing/:id", async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const itemToDelete = (db.pricingTiers || []).find((p: any) => p.id === id);

      if (itemToDelete && itemToDelete.imageUrl) {
        await deleteCloudinaryFileFromUrl(itemToDelete.imageUrl);
      }

      db.pricingTiers = (db.pricingTiers || []).filter((p: any) => p.id !== id);
      await saveDb(db);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error in DELETE /api/producer/pricing/:id:", err);
      res.status(500).json({ error: "Failed to delete pricing tier." });
    }
  });


  // 404 handler for unmatched API routes so they NEVER fall through to Vite SPA HTML fallback
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.error("Vite server initialization failed:", viteErr);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind the server LAST
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dee-Maker server running at http://0.0.0.0:${PORT}`);
    
    // Initialize DB in background
    getDb().catch(dbErr => {
      console.error("Background database initialization failed:", dbErr);
    });
  });
}

startServer();
