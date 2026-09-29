import { AppData, IntakeQuestion } from '../types';

export const defaultIntakeQuestions: IntakeQuestion[] = [
  // Section 1: Project scope
  {
    id: 'q-problem',
    label: 'What problem is your app/website solving?',
    section: 'Project scope',
    type: 'long_text',
    required: true,
    appliesTo: 'both',
    order: 1
  },
  {
    id: 'q-target-user',
    label: 'Who is the end user / your target customer?',
    section: 'Project scope',
    type: 'long_text',
    required: false,
    appliesTo: 'both',
    order: 2
  },
  {
    id: 'q-must-haves',
    label: 'Core features — MUST-HAVES',
    section: 'Project scope',
    type: 'long_text',
    required: true,
    appliesTo: 'both',
    order: 3
  },
  {
    id: 'q-nice-haves',
    label: 'Core features — NICE-TO-HAVES',
    section: 'Project scope',
    type: 'long_text',
    required: false,
    appliesTo: 'both',
    order: 4
  },
  {
    id: 'q-platform',
    label: 'Platform',
    section: 'Project scope',
    type: 'select',
    options: ['Web', 'iOS', 'Android', 'Cross-platform'],
    required: false,
    appliesTo: 'app',
    order: 5
  },
  {
    id: 'q-references',
    label: 'Any existing designs, wireframes, or reference apps/websites you like?',
    section: 'Project scope',
    type: 'long_text',
    note: 'Links welcome',
    required: false,
    appliesTo: 'both',
    order: 6
  },

  // Section 2: Technical and access
  {
    id: 'q-domain-choice',
    label: 'Do you already have a domain name?',
    section: 'Technical and access',
    type: 'yes_no',
    required: false,
    appliesTo: 'both',
    order: 7
  },
  {
    id: 'q-domain-name',
    label: 'Domain name (if yes)',
    section: 'Technical and access',
    type: 'short_text',
    required: false,
    appliesTo: 'both',
    order: 8
  },
  {
    id: 'q-hosting',
    label: 'Do you already have hosting?',
    section: 'Technical and access',
    type: 'select',
    options: ['Yes', 'No', 'Not sure, please set one up for me'],
    required: false,
    appliesTo: 'both',
    order: 9
  },
  {
    id: 'q-apple-account',
    label: 'Apple Developer account?',
    section: 'Technical and access',
    type: 'select',
    options: ['Yes', 'No', 'Not yet'],
    required: false,
    appliesTo: 'app',
    order: 10
  },
  {
    id: 'q-google-account',
    label: 'Google Play Console account?',
    section: 'Technical and access',
    type: 'select',
    options: ['Yes', 'No', 'Not yet'],
    required: false,
    appliesTo: 'app',
    order: 11
  },
  {
    id: 'q-3rd-services',
    label: 'Which third-party services do you need?',
    section: 'Technical and access',
    type: 'multi_select',
    options: ['Payments (Stripe/Paystack)', 'Maps', 'Sign-in/Auth', 'Email', 'SMS', 'Other'],
    required: false,
    appliesTo: 'both',
    order: 12
  },
  {
    id: 'q-3rd-details',
    label: 'Third-party service details (optional)',
    section: 'Technical and access',
    type: 'short_text',
    required: false,
    appliesTo: 'both',
    order: 13
  },
  {
    id: 'q-database-pref',
    label: 'Database or backend preferences, if any',
    section: 'Technical and access',
    type: 'short_text',
    required: false,
    appliesTo: 'both',
    order: 14
  },
  {
    id: 'q-brand-assets',
    label: 'Existing brand assets: logo, colors, fonts, content/copy',
    section: 'Technical and access',
    type: 'short_text',
    note: 'You can send files later',
    required: false,
    appliesTo: 'both',
    order: 15
  },

  // Section 3: Business logic
  {
    id: 'q-user-roles',
    label: 'User roles (admin, regular user, etc.) and what each can do',
    section: 'Business logic',
    type: 'long_text',
    required: false,
    appliesTo: 'both',
    order: 16
  },
  {
    id: 'q-monetization',
    label: 'Payment / monetization model, if any',
    section: 'Business logic',
    type: 'long_text',
    required: false,
    appliesTo: 'both',
    order: 17
  },
  {
    id: 'q-compliance',
    label: 'Data you need to store, and any compliance concerns such as user data or payments',
    section: 'Business logic',
    type: 'long_text',
    required: false,
    appliesTo: 'both',
    order: 18
  },

  // Section 4: Practical / contract
  {
    id: 'q-budget',
    label: 'Budget',
    section: 'Practical / contract',
    type: 'short_text',
    required: false,
    appliesTo: 'both',
    order: 19
  },
  {
    id: 'q-timeline',
    label: 'Timeline / deadline',
    section: 'Practical / contract',
    type: 'short_text',
    required: false,
    appliesTo: 'both',
    order: 20
  },
  {
    id: 'q-ip-ownership',
    label: 'Who should own the code/IP after delivery?',
    section: 'Practical / contract',
    type: 'select',
    options: ['Me (the client)', 'Dee-Maker until fully paid', "Let's discuss"],
    required: false,
    appliesTo: 'both',
    order: 21
  },
  {
    id: 'q-maintenance',
    label: 'Maintenance / support expectations after launch',
    section: 'Practical / contract',
    type: 'long_text',
    required: false,
    appliesTo: 'both',
    order: 22
  },
  {
    id: 'q-contact-person',
    label: 'Point of contact for approvals and feedback (name + phone/email)',
    section: 'Practical / contract',
    type: 'short_text',
    required: false,
    appliesTo: 'both',
    order: 23
  }
];

export const initialDefaultData: AppData = {
  intakeQuestions: defaultIntakeQuestions,
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
      clientName: "Tyler Chen",
      company: "SwiftLend",
      role: "Co-Founder",
      quote: "Zero fluff, great communication, and pristine code. We went from wireframe to first live rental transaction on Stripe in under two months.",
      rating: 5
    }
  ],
  faqs: [
    {
      id: "faq-1",
      question: "How long does a typical mobile app build take?",
      answer: "Most MVP builds take between 4 to 8 weeks depending on scope. Simple consumer apps with auth and basic CRUD can be ready in 4 weeks, while complex full-stack apps with payments, real-time messaging, and admin portals typically require 6 to 8 weeks."
    },
    {
      id: "faq-2",
      question: "Do you build native apps or cross-platform?",
      answer: "We specialize in React Native (TypeScript), which produces high-performance native iOS and Android apps from a unified codebase. This cuts your development timeline in half while providing 60fps native UI performance."
    },
    {
      id: "faq-3",
      question: "Will you help submit the app to the Apple App Store and Google Play?",
      answer: "Yes, 100%. App Store submission, testflight beta distribution, Google Play console setup, privacy policy compliance, and handling Apple review feedback are included in every mobile project."
    },
    {
      id: "faq-4",
      question: "How does payment and project billing work?",
      answer: "Projects are billed in milestones: 40% upfront deposit upon contract signing, 30% upon interactive beta prototype delivery, and 30% upon final App Store approval and source code handover."
    }
  ],
  myApps: [
    {
      id: "app-1",
      name: "FocusGrid Task Matrix",
      description: "Eisenhower matrix priority manager built for technical founders. Includes keyboard-first navigation and offline SQLite sync.",
      howItWasMade: "Built with React Native, Expo, SQLite, and Tailwind CSS. Features custom gesture handlers and biometric local lock.",
      updateNotes: "v2.1.0: Added iCloud backup and custom color theme profiles.",
      images: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"
      ],
      downloadUrl: "https://raw.githubusercontent.com/mdn/learning-area/master/javascript/oojs/json/superheroes.json",
      fileName: "FocusGrid-v2.1.apk"
    },
    {
      id: "app-2",
      name: "PulseLog Biomarker Journal",
      description: "Quick-entry symptom and biomarker logger designed with doctors for patients tracking chronic health patterns.",
      howItWasMade: "Engineered using TypeScript, React Native, and WatermelonDB for instant sub-10ms query times and end-to-end encryption.",
      updateNotes: "v1.4.0: Added PDF export formatted for clinical consultations.",
      images: [
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80"
      ],
      downloadUrl: "https://raw.githubusercontent.com/mdn/learning-area/master/javascript/oojs/json/superheroes.json",
      fileName: "PulseLog-v1.4.apk"
    }
  ],
  pricingTiers: [
    {
      id: "tier-1",
      name: "MVP Mobile Sprint",
      tagline: "From wireframe to TestFlight & Google Play beta",
      price: "$4,500",
      period: "fixed price",
      turnaround: "3 - 4 Weeks",
      bestFor: "Early-stage founders validating market demand",
      category: "app",
      popular: false,
      features: [
        "Cross-platform iOS & Android App",
        "User Auth (Email, Apple, Google)",
        "Database & Cloud Backend (Firebase / Firestore)",
        "Clean UI/UX Design System",
        "TestFlight & Play Store Beta setup",
        "30-day Post-Launch Warranty"
      ]
    },
    {
      id: "tier-2",
      name: "Full Production Build",
      tagline: "Production-grade system with custom dashboard & payments",
      price: "$8,500",
      period: "fixed price",
      turnaround: "6 - 8 Weeks",
      bestFor: "Funded startups and businesses scaling up",
      category: "app",
      popular: true,
      features: [
        "Full Mobile App (iOS & Android)",
        "Admin Web Dashboard",
        "Stripe / RevenueCat In-App Purchases",
        "Push Notifications & Analytics",
        "App Store & Google Play Launch Guarantees",
        "Automated CI/CD Deployment Pipeline",
        "60-day Post-Launch Support & Bug Fixes"
      ]
    },
    {
      id: "tier-3",
      name: "Dedicated Engineering Retainer",
      tagline: "Fractional CTO & agile sprint velocity",
      price: "$3,800",
      period: "/month",
      turnaround: "Ongoing / Agile",
      bestFor: "Post-launch products needing rapid weekly feature shipping",
      category: "app",
      popular: false,
      features: [
        "20 Dedicated Hours / Week",
        "Direct Slack & Async Video Access",
        "Continuous Feature Iteration",
        "Architecture Reviews & Performance Tuning",
        "Priority Emergency Hotfixes",
        "Monthly Roadmap Alignment Calls"
      ]
    }
  ]
};
