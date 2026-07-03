// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyAu7f6BZ9ma-e16PlxBHoX6iy6kPe0Xl6M",
    authDomain: "cot-ministries-da557.firebaseapp.com",
    projectId: "cot-ministries-da557",
    storageBucket: "cot-ministries-da557.firebasestorage.app",
    messagingSenderId: "894149474214",
    appId: "1:894149474214:web:049c826b825ecf18108167",
    measurementId: "G-23Z0KJQV2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export default app;
