// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child } from 'firebase/database';

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
export const db = getDatabase(app);

// Save user links to Firebase (preserves your existing data structure)
export const saveUserLinks = async (username, links) => {
  try {
    // Save to a separate node 'socialLinks' to avoid conflicts with studentLogs
    await set(ref(db, `socialLinks/${username}`), {
      links: links,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    throw error;
  }
};

// Get user links from Firebase
export const getUserLinks = async (username) => {
  try {
    const snapshot = await get(ref(db, `socialLinks/${username}`));
    if (snapshot.exists()) {
      return snapshot.val().links;
    }
    return null;
  } catch (error) {
    console.error("Error loading from Firebase:", error);
    throw error;
  }
};

// Optional: Get all users (if needed)
export const getAllUsers = async () => {
  try {
    const snapshot = await get(ref(db, 'socialLinks'));
    if (snapshot.exists()) {
      return Object.keys(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};