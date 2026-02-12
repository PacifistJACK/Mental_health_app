import React, { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Heart,
  Smile,
  Sun,
  Star,
  Cloud,
  Flower,
  Leaf,
  Users,
  MessageCircle,
  Plus,
  User
} from "lucide-react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AnimatedNavbar from "../components/AnimatedNavbar";
import { timeAgo } from "../utils/timeAgo";
import CommentSection from "../components/CommentSection";
import { addDoc } from "firebase/firestore";

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
          duration: 15 + Math.random() * 20,
          delay: Math.random() * 5
        };
      })
    );
  }, []);

  /* FETCH POSTS (NO USER LOOKUPS) */
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            reactions: {
              relate: data.reactions?.relate || { count: 0, users: [] },
              support: data.reactions?.support || { count: 0, users: [] }
            }
          };
        })
      );
    });

    return () => unsub();
  }, []);

  /* NAVBAR SCROLL */
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  /* REACTION TOGGLE */
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
    // AFTER updateDoc(...)
if (!reacted && type === "support" && post.authorId !== user.uid) {
  await addDoc(collection(db, "notifications"), {
    toUserId: post.authorId,
    fromUserId: user.uid,
    fromName: user.displayName || "Someone",
    fromPhotoURL: user.photoURL || null,
    type: "support",
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

      {/* FLOATING ICONS */}
      {floatingElements.map((el) => {
        const Icon = el.icon;
        return (
          <motion.div
            key={el.id}
            className={`absolute ${el.color} ${el.size}`}
            style={{ left: `${el.x}%`, top: `${el.y}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
            transition={{ duration: el.duration, repeat: Infinity }}
          >
            <Icon />
          </motion.div>
        );
      })}

      <AnimatedNavbar
        scrolled={scrolled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main className="relative z-10 px-4 pt-32 pb-32">

        {/* EMPTY STATE */}
        {posts.length === 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto text-center"
            >
              <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
                Community Support 💬
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                A safe place to connect, share experiences, and support each other.
              </p>
            </motion.div>

            <div className="grid max-w-5xl grid-cols-1 gap-8 mx-auto mt-16 md:grid-cols-3">
              {[Users, MessageCircle, Heart].map((Icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  className="p-6 shadow-lg bg-white/70 backdrop-blur-sm rounded-2xl"
                >
                  <Icon className="w-8 h-8 mb-4 text-purple-500" />
                  <h3 className="mb-2 font-semibold">
                    {i === 0
                      ? "Connect Safely"
                      : i === 1
                      ? "Share & Listen"
                      : "Kindness First"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {i === 0
                      ? "Engage anonymously in a respectful environment."
                      : i === 1
                      ? "Real conversations with people who understand."
                      : "Built around empathy, not judgment."}
                  </p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* POSTS */}
        {posts.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 shadow bg-white/80 backdrop-blur-lg rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  {post.anonymous ? (
                    <div className="flex items-center justify-center bg-gray-200 rounded-full w-9 h-9">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  ) : post.authorPhotoURL ? (
                    <img
                      src={post.authorPhotoURL}
                      className="object-cover rounded-full w-9 h-9"
                      alt="pfp"
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-purple-200 rounded-full w-9 h-9">
                      <Heart className="w-4 h-4 text-purple-600" />
                    </div>
                  )}

                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{post.authorName}</span>
                    <span className="mx-1">•</span>
                    <span className="text-gray-500">
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="mb-4 text-gray-800 whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex gap-3 mb-2">
                  {[
                    { type: "relate", label: "💙 I relate" },
                    { type: "support", label: "🤍 Support" }
                  ].map(({ type, label }) => {
                    const active =
                      post.reactions[type].users.includes(user?.uid);
                    return (
                      <motion.button
                        key={type}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleReaction(post, type)}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          active
                            ? "bg-purple-100 text-purple-600 font-semibold"
                            : "bg-gray-100 text-gray-600 hover:bg-purple-50"
                        }`}
                      >
                        {label} {post.reactions[type].count}
                      </motion.button>
                    );
                  })}
                </div>

                {/* COMMENTS */}
                <CommentSection postId={post.id}  post={post}/>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreatePost}
        className="fixed z-20 p-4 text-white rounded-full shadow-xl bottom-8 right-8 bg-gradient-to-r from-pink-400 to-purple-500"
      >
        <Plus />
      </motion.button>
    </div>
  );
};

export default Community;
