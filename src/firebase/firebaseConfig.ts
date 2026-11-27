import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4fJbdtSo7kdtJv0ZJZBwxMgfXMF7QK1w",
  authDomain: "recipefinder-3a5e9.firebaseapp.com",
  projectId: "recipefinder-3a5e9",
  storageBucket: "recipefinder-3a5e9.firebasestorage.app",
  messagingSenderId: "487497673092",
  appId: "1:487497673092:web:d1aafe1dcec88e2f8cd5d1",
  measurementId: "G-8KV5YZW1WX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
