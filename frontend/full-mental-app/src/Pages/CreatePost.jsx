import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);

      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: anonymous
          ? "Anonymous"
          : user.displayName || "User",

        // 🔥 THE FIX (THIS IS IT)
        authorPhotoURL: anonymous ? null : user.photoURL || null,

        anonymous,
        content,
        reactions: {
          relate: { count: 0, users: [] },
          support: { count: 0, users: [] }
        },
        createdAt: serverTimestamp()
      });

      navigate("/community");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl p-6 shadow bg-white/80 backdrop-blur rounded-2xl"
      >
        <h1 className="mb-4 text-2xl font-bold">Create a Post</h1>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share what's on your mind…"
          className="w-full h-32 p-3 mb-4 border rounded-lg"
        />

        <label className="flex items-center gap-2 mb-4 text-sm">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          Post anonymously
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2 text-white rounded-lg bg-gradient-to-r from-pink-400 to-purple-500"
        >
          {loading ? "Posting…" : "Post"}
        </button>
      </motion.div>
    </div>
  );
};

export default CreatePost;
