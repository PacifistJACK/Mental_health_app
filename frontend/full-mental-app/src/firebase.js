// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBg4wAw36Uca4rWY1j9ZqbJREzsqVvDF_E",
  authDomain: "mindfull-community.firebaseapp.com",
  projectId: "mindfull-community",
  storageBucket: "mindfull-community.firebasestorage.app",
  messagingSenderId: "768352483838",
  appId: "1:768352483838:web:d94e1b3b640b8cb2ace8af",
  measurementId: "G-2PJ4PDL1M6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)
