// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyApo7T486mxPBuFFAOTKa13ktiDoz_Ww-4",
  authDomain: "act1maamrich.firebaseapp.com",
  projectId: "act1maamrich",
  storageBucket: "act1maamrich.firebasestorage.app",
  messagingSenderId: "722768316793",
  appId: "1:722768316793:web:bcef9477e003349c7807a8",
  measurementId: "G-JRPXB6C4ZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Save user links to Firestore
export const saveUserLinks = async (username, links) => {
  try {
    await setDoc(doc(db, "socialLinks", username), {
      links: links,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error saving to Firestore:", error);
    throw error;
  }
};

// Get user links from Firestore
export const getUserLinks = async (username) => {
  try {
    const docRef = doc(db, "socialLinks", username);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().links;
    }
    return null;
  } catch (error) {
    console.error("Error loading from Firestore:", error);
    throw error;
  }
};