import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Camera, Pencil } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import AnimatedNavbar from "../components/AnimatedNavbar";

const CLOUD_NAME = "djxmd61lq"; // 🔁 replace
const UPLOAD_PRESET = "mindful_uploads"; // 🔁 replace

const Profile = () => {
  const { user } = useAuth();

  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* 🔁 Load profile from Firestore */
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUsername(snap.data().displayName || "");
      }
    };

    loadProfile();
  }, [user]);

  /* ✅ SAVE USERNAME (AUTH + FIRESTORE) */
  const saveUsername = async () => {
    if (!user || !username.trim()) return;

    await updateProfile(auth.currentUser, {
      displayName: username
    });

    await updateDoc(doc(db, "users", user.uid), {
      displayName: username
    });

    setEditing(false);
  };

  /* ✅ CLOUDINARY PROFILE PHOTO UPLOAD */
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();
      const photoURL = data.secure_url;

      // Update Firebase Auth
      await updateProfile(auth.currentUser, {
        photoURL
      });

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        photoURL
      });

      setUploading(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You must be logged in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <AnimatedNavbar
        scrolled={scrolled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <div className="max-w-4xl px-4 mx-auto pt-28">
        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 shadow-xl bg-white/80 backdrop-blur-lg rounded-3xl"
        >
          {/* AVATAR */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="object-cover w-32 h-32 rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-32 h-32 bg-gray-200 rounded-full">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* UPLOAD BUTTON */}
            <label className="absolute p-2 bg-white rounded-full shadow cursor-pointer bottom-1 right-1">
              <Camera className="w-4 h-4 text-gray-600" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                hidden
              />
            </label>
          </div>

          {uploading && (
            <p className="mb-4 text-sm text-center text-gray-500">
              Uploading image…
            </p>
          )}

          {/* USERNAME */}
          <div className="text-center">
            {!editing ? (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.displayName || "User"}
                </h2>
                <button onClick={() => setEditing(true)}>
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-3 py-1 border rounded-lg"
                />
                <button
                  onClick={saveUsername}
                  className="px-3 py-1 text-white bg-purple-500 rounded-lg"
                >
                  Save
                </button>
              </div>
            )}

            <p className="mt-2 text-sm text-gray-500">{user.email}</p>
          </div>
        </motion.div>

        {/* POSTS PLACEHOLDER */}
        <div className="mt-10">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">
            Your Posts
          </h3>

          <div className="p-6 text-center text-gray-500 shadow bg-white/60 backdrop-blur-md rounded-2xl">
            <p>No posts yet.</p>
            <p className="mt-2 text-sm">
              When you post, they’ll appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
