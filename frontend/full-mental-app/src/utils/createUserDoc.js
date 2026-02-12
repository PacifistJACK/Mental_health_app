import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const createUserDoc = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // only create if it doesn't exist
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Anonymous",
      photoURL: user.photoURL || null,
      provider: user.providerData[0]?.providerId,
      createdAt: serverTimestamp()
    });
  }
};
