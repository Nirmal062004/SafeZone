// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);