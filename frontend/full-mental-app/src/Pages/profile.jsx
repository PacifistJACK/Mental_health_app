import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Camera, Pencil, Trash2 } from "lucide-react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import AnimatedNavbar from "../components/AnimatedNavbar";

const CLOUD_NAME = "djxmd61lq";
const UPLOAD_PRESET = "mindful_uploads";

const Profile = () => {
  const { user } = useAuth();

  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUsername(snap.data().displayName || "");
      }
    };

    loadProfile();
  }, [user]);

  /* ================= LOAD USER POSTS ================= */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "posts"),
      where("authorId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, [user]);

  /* ================= SAVE USERNAME ================= */
  const saveUsername = async () => {
    if (!username.trim()) return;

    await updateProfile(auth.currentUser, {
      displayName: username
    });

    await updateDoc(doc(db, "users", user.uid), {
      displayName: username
    });

    setEditing(false);
  };

  /* ================= CLOUDINARY UPLOAD ================= */
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      await updateProfile(auth.currentUser, {
        photoURL: data.secure_url
      });

      await updateDoc(doc(db, "users", user.uid), {
        photoURL: data.secure_url
      });

      setUploading(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  /* ================= DELETE POST ================= */
  const deletePost = async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
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
        {/* ================= PROFILE CARD ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 mb-12 shadow-xl bg-white/80 backdrop-blur-lg rounded-3xl"
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

            <label className="absolute p-2 bg-white rounded-full shadow cursor-pointer bottom-1 right-1">
              <Camera className="w-4 h-4 text-gray-600" />
              <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
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

        {/* ================= USER POSTS ================= */}
        <div>
          <h3 className="mb-6 text-xl font-semibold text-gray-800">
            Your Posts
          </h3>

          {posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500 shadow bg-white/60 backdrop-blur-md rounded-2xl">
              <p>No posts yet.</p>
              <p className="mt-2 text-sm">
                When you post, they’ll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 shadow bg-white/80 backdrop-blur-lg rounded-2xl"
                >
                  <p className="mb-4 text-gray-800 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <button
                    onClick={() => deletePost(post.id)}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
