// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Authentication
import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firestore
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCFsZfau0dTZkx2kTjm_m5gjiYvIQ6t_Jw",
  authDomain: "crediloan-bf91e.firebaseapp.com",
  projectId: "crediloan-bf91e",
  storageBucket: "crediloan-bf91e.firebasestorage.app",
  messagingSenderId: "102042966494",
  appId: "1:102042966494:web:fa6ebb5c4a1e5ec6a1e54f"
};

// Initialize
export const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);