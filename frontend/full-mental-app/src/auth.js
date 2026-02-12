import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

/* Email / Password */
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signupWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

/* Google */
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

/* Logout */
export const logoutUser = () => signOut(auth);
