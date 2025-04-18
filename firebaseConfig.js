// Import the functions you need from the SDKs you need
<<<<<<< HEAD
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';  // Firebase Authentication
import { getFirestore } from 'firebase/firestore';  // Firestore Database
=======
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
>>>>>>> 47cda08b972f56a2edb922e140c532d54c9a89b2

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
<<<<<<< HEAD

// Initialize Firebase Authentication & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

=======
const analytics = getAnalytics(app);
>>>>>>> 47cda08b972f56a2edb922e140c532d54c9a89b2
