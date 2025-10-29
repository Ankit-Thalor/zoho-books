// Firebase Configuration File
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6_M0AxF04kmHkZDJw6wGab9fiVdUlVyw",
  authDomain: "zoho-books-36fe6.firebaseapp.com",
  databaseURL: "https://zoho-books-36fe6-default-rtdb.firebaseio.com",
  projectId: "zoho-books-36fe6",
  storageBucket: "zoho-books-36fe6.firebasestorage.app",
  messagingSenderId: "708594369091",
  appId: "1:708594369091:web:e9307311ca59a71d9d4af6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };

