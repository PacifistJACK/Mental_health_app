// SAME IMPORTS YOU ALREADY HAVE
import React, { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Heart, Smile, Sun, Star, Cloud, Flower, Leaf,
  Users, MessageCircle, Plus, User
} from "lucide-react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AnimatedNavbar from "../components/AnimatedNavbar";
import { timeAgo } from "../utils/timeAgo";
import CommentSection from "../components/CommentSection";

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);
  const [posts, setPosts] = useState([]);

  /* FLOATING BACKGROUND */
  useEffect(() => {
    const icons = [
      { icon: Heart, color: "text-pink-400", size: "w-6 h-6" },
      { icon: Smile, color: "text-yellow-400", size: "w-6 h-6" },
      { icon: Sun, color: "text-orange-400", size: "w-8 h-8" },
      { icon: Star, color: "text-purple-400", size: "w-5 h-5" },
      { icon: Cloud, color: "text-blue-300", size: "w-7 h-7" },
      { icon: Flower, color: "text-pink-300", size: "w-6 h-6" },
      { icon: Leaf, color: "text-green-400", size: "w-5 h-5" }
    ];

    setFloatingElements(
      [...Array(15)].map((_, i) => {
        const el = icons[Math.floor(Math.random() * icons.length)];
        return {
          id: i,
          ...el,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: 15 + Math.random() * 20
        };
      })
    );
  }, []);

  /* FETCH POSTS */
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          reactions: {
            relate: d.data().reactions?.relate || { count: 0, users: [] },
            support: d.data().reactions?.support || { count: 0, users: [] }
          }
        }))
      );
    });
  }, []);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", y => setScrolled(y > 40));

  /* REACTION TOGGLE + NOTIFICATION */
  const toggleReaction = async (post, type) => {
    if (!user) return navigate("/login");

    const ref = doc(db, "posts", post.id);
    const reacted = post.reactions[type].users.includes(user.uid);

    await updateDoc(ref, {
      [`reactions.${type}.users`]: reacted
        ? arrayRemove(user.uid)
        : arrayUnion(user.uid),
      [`reactions.${type}.count`]: reacted
        ? post.reactions[type].count - 1
        : post.reactions[type].count + 1
    });

    // 🔔 REACTION NOTIFICATION
    if (!reacted && post.authorId !== user.uid) {
      await addDoc(collection(db, "notifications"), {
        toUserId: post.authorId,
        fromUserId: user.uid,
        fromName: user.displayName || "Someone",
        fromPhotoURL: user.photoURL || null,
        type: type, // "relate" or "support"
        postId: post.id,
        postPreview: post.content.slice(0, 60),
        read: false,
        createdAt: new Date()
      });
    }
  };

  const handleCreatePost = () => {
    user ? navigate("/community/post") : navigate("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50">

      <AnimatedNavbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="relative z-10 px-4 pt-32 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {posts.map(post => (
            <motion.div key={post.id} className="p-6 shadow bg-white/80 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                {post.anonymous ? (
                  <div className="flex items-center justify-center bg-gray-200 rounded-full w-9 h-9">
                    <User size={16} />
                  </div>
                ) : post.authorPhotoURL ? (
                  <img src={post.authorPhotoURL} className="object-cover rounded-full w-9 h-9" />
                ) : (
                  <div className="flex items-center justify-center bg-purple-200 rounded-full w-9 h-9">
                    <Heart size={14} />
                  </div>
                )}

                <div className="text-sm">
                  <span className="font-medium">{post.authorName}</span>
                  <span className="mx-1">•</span>
                  <span className="text-gray-500">{timeAgo(post.createdAt)}</span>
                </div>
              </div>

              <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

              <div className="flex gap-3 mb-3">
                {["relate", "support"].map(type => {
                  const active = post.reactions[type].users.includes(user?.uid);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleReaction(post, type)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        active
                          ? "bg-purple-100 text-purple-600 font-semibold"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {type === "relate" ? "💙 I relate" : "🤍 Support"}{" "}
                      {post.reactions[type].count}
                    </button>
                  );
                })}
              </div>

              <CommentSection postId={post.id} post={post} />
            </motion.div>
          ))}
        </div>
      </main>

      <button
        onClick={handleCreatePost}
        className="fixed p-4 text-white rounded-full shadow-xl bottom-8 right-8 bg-gradient-to-r from-pink-400 to-purple-500"
      >
        <Plus />
      </button>
    </div>
  );
};

export default Community;
