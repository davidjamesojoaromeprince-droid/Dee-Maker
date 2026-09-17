export type RequestStatus = 'New' | 'Contacted' | 'In Progress' | 'Delivered';
export type PaymentStatus = 'Unpaid' | 'Deposit Paid' | 'Fully Paid';

export interface ProjectRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  appName: string;
  appDescription: string;
  preferredContact: 'whatsapp' | 'email';
  heardFrom?: string;
  selectedPackage?: string;
  projectType?: 'app' | 'website';
  paymentStatus?: PaymentStatus;
  status: RequestStatus;
  aiConfirmationMessage: string;
  createdAt: string;
  notes?: string;
}

export interface CaseStudy {
  id: string;
  portfolioId: string;
  title: string;
  client: string;
  category: string;
  summary: string;
  problem: string;
  approach: string;
  outcome: string;
  metrics: string[];
  imageUrl: string;
  techStack: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  downloadUrl?: string;
  fileName?: string;
  techStack: string[];
  createdAt: string;
  caseStudy?: CaseStudy;
}

export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  turnaround: string;
  bestFor: string;
  category: 'app' | 'website';
  imageUrl?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  role: string;
  quote: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface AboutData {
  title: string;
  story: string;
  yearsExperience: number;
  appsBuilt: number;
  skills: string[];
  heroImage?: string;
  heroImageUrl?: string;
}

export interface PrivateFeedback {
  id: string;
  name: string;
  email: string;
  message: string;
  rating?: number;
  createdAt: string;
}

export interface EmailSettings {
  notifyEmail: string;
  enabled: boolean;
  staleAlertDays?: number;
  logs: string[];
}

export interface MyApp {
  id: string;
  name: string;
  images: string[];
  description: string;
  howItWasMade: string;
  updateNotes: string;
  downloadUrl?: string;
  fileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppData {
  about: AboutData;
  portfolio: PortfolioItem[];
  caseStudies?: CaseStudy[];
  myApps?: MyApp[];
  pricingTiers?: PricingTier[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
}

export interface FullProducerData extends AppData {
  requests: ProjectRequest[];
  privateFeedback: PrivateFeedback[];
  emailSettings: EmailSettings;
}
