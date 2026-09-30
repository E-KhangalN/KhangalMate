import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBbBz8hRdtpu57WEYfb43fS6Hsh4eABIeg',
  authDomain: 'matmate-9bf13.firebaseapp.com',
  projectId: 'matmate-9bf13',
  storageBucket: 'matmate-9bf13.firebasestorage.app',
  messagingSenderId: '616564808171',
  appId: '1:616564808171:web:411cf963cc4d2c2272921ae',
  measurementId: 'G-3SXX8F40T0',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
