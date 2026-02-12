import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase";

// ⚠️ if firebase already initialized, reuse app
import { getApp, getApps } from "firebase/app";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
