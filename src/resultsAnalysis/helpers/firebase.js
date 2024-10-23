// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4cjBDz9cnbuSEJCaZZ-XR06H8wjHXQgs",
  authDomain: "santeo-77127.firebaseapp.com",
  projectId: "santeo-77127",
  storageBucket: "santeo-77127.appspot.com",
  messagingSenderId: "559278865466",
  appId: "1:559278865466:web:9677f4996932e43ff58903",
  measurementId: "G-P3HT64JSLS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);
