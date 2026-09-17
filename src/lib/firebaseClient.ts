import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCoATnozrOrs19T7ARS8u2qo-S39mGDIPc",
  authDomain: "responsible-pagoda-smbw7.firebaseapp.com",
  projectId: "responsible-pagoda-smbw7",
  storageBucket: "responsible-pagoda-smbw7.firebasestorage.app",
  messagingSenderId: "668629051536",
  appId: "1:668629051536:web:a921c11cbeb9f547121015",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
