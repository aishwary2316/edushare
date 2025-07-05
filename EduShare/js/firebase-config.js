// TeacherShare - Firebase Configuration
// This file initializes Firebase app and exports auth and firestore instances

// Firebase configuration object - replace with your actual config
//const firebaseConfig = {
    // REPLACE_ME: Add your Firebase project configuration here
    // Example:
    // apiKey: "your-api-key",
    // authDomain: "your-project.firebaseapp.com",
    // projectId: "your-project-id",
    // storageBucket: "your-project.appspot.com",
    // messagingSenderId: "123456789",
    // appId: "your-app-id"
//};

//import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
//import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoTinBk7xxu1gg5YWz3uQyII8gba8Jmx8",
  authDomain: "edushare-82cc3.firebaseapp.com",
  projectId: "edushare-82cc3",
  storageBucket: "edushare-82cc3.firebasestorage.app",
  messagingSenderId: "970916376850",
  appId: "1:970916376850:web:535abd8a0419e5948343cb",
  measurementId: "G-LM50L7NJJY"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Export Firebase services for use in other files
const auth = firebase.auth();
const db = firebase.firestore();

// Make services available globally
window.auth = auth;
window.db = db;