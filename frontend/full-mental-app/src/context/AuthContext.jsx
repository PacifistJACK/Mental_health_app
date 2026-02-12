import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔁 Auth listener */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* 🔧 Ensure Firestore user exists */
  const ensureUserDoc = async (firebaseUser) => {
    if (!firebaseUser) return;

    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "User",
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || null,
        createdAt: new Date()
      });
    }
  };

  /* 📧 Email auth */
  const signupWithEmail = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, {
      displayName: name
    });

    await ensureUserDoc({
      ...cred.user,
      displayName: name
    });

    return cred;
  };

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  /* 🔵 GOOGLE LOGIN (FIXED) */
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);

    await ensureUserDoc(res.user);

    return res;
  };

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
