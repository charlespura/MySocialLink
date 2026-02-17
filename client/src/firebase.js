// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Save user links and password to Firestore
export const saveUserLinks = async (username, links, password) => {
  try {
    await setDoc(doc(db, "socialLinks", username), {
      links: links,
      password: password, // Save the password
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
      return {
        links: docSnap.data().links,
        password: docSnap.data().password
      };
    }
    return null;
  } catch (error) {
    console.error("Error loading from Firestore:", error);
    throw error;
  }
};

// Verify password
export const verifyPassword = async (username, enteredPassword) => {
  try {
    const docRef = doc(db, "socialLinks", username);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().password === enteredPassword;
    }
    return false;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};