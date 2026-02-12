import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔁 Listen to auth state */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* 📧 Email + Password */
  const signupWithEmail = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  /* 🔵 Google Login */
  const googleProvider = new GoogleAuthProvider();
  const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider);

  /* 🚪 Logout */
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        signupWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
