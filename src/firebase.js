// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAYkOS95euaRNOwx-w45Egh6sO_fIhJXXQ",
    authDomain: "e-quiz2.firebaseapp.com",
    databaseURL: "https://e-quiz2-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "e-quiz2",
    storageBucket: "e-quiz2.firebasestorage.app",
    messagingSenderId: "229628936817",
    appId: "1:229628936817:web:2ebaebf3b62e7a3e85d1d0",
    measurementId: "G-C7PDY73R2R"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and Authentication
export const database = getDatabase(app);
export const auth = getAuth(app);