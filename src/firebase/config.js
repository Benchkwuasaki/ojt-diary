// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAO1ZGZvXZ-l9DYlKgWR-d3BSI3gsOMEoM",
  authDomain: "ojt-diary.firebaseapp.com",
  projectId: "ojt-diary",
  storageBucket: "ojt-diary.firebasestorage.app",
  messagingSenderId: "841748332412",
  appId: "1:841748332412:web:959ed3a762894e1397eef9",
  measurementId: "G-D6F5M2E4YV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;