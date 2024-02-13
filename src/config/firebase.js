// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOSOdQzBuAe6SaI1JjM0unp8V9K51R-RE",
  authDomain: "chat-b862d.firebaseapp.com",
  projectId: "chat-b862d",
  storageBucket: "chat-b862d.appspot.com",
  messagingSenderId: "253223542915",
  appId: "1:253223542915:web:7dfe0ea05362a35b81bbb6",
  measurementId: "G-0YWD23B393"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const real_db = getDatabase(app);
export const functions = getFunctions(app);
connectFunctionsEmulator(functions, "127.0.0.1", 5001);
