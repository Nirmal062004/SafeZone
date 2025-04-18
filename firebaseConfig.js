// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';  // Firebase Authentication
import { getFirestore } from 'firebase/firestore';  // Firestore Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKCdJbt5P0KHOu-_qmPeNreeu7-wk_BxA",
  authDomain: "safe-zone-45938.firebaseapp.com",
  projectId: "safe-zone-45938",
  storageBucket: "safe-zone-45938.firebasestorage.app",
  messagingSenderId: "562656434078",
  appId: "1:562656434078:web:9a15856c687e27cadf288f",
  measurementId: "G-HZTQKF9LDX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

