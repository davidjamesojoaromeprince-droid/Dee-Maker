import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAMSV20Yt6IqLGtaZh9jsQcnQqFKx5Bw_o",
  authDomain: "deemakers-site.firebaseapp.com",
  projectId: "deemakers-site",
  storageBucket: "deemakers-site.firebasestorage.app",
  messagingSenderId: "885290099362",
  appId: "1:885290099362:web:b559d1c949947d288cedfb",
  measurementId: "G-HF04CT8D07"
};

const app = initializeApp(firebaseConfig);

// Initialize analytics conditionally to prevent errors in non-browser environments
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export const auth = getAuth(app);
export const db = getFirestore(app);
