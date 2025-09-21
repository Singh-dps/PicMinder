// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'studio-9412335704-1b357',
  appId: '1:981122935778:web:c9235e7aff80f9ddcda7bb',
  apiKey: 'AIzaSyAzQ_8Lxs4-SCbgfiOGG2EB3rYwX3FHmVM',
  authDomain: 'studio-9412335704-1b357.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '981122935778',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
