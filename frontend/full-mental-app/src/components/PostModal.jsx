import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { X, Trash2, User, Heart } from "lucide-react";
import { timeAgo } from "../utils/timeAgo";

const PostModal = ({ post, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  /* LIVE COMMENTS */
  useEffect(() => {
    const q = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, snap =>
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [post.id]);

  /* REACTION TOGGLE + NOTIFICATION */
  const toggleReaction = async (type) => {
    if (!user) return;

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
        type, // "relate" | "support"
        postId: post.id,
        postPreview: post.content.slice(0, 60),
        read: false,
        createdAt: new Date()
      });
    }
  };

  /* ADD COMMENT + NOTIFICATION */
  const addComment = async () => {
    if (!user || !text.trim()) return;

    await addDoc(collection(db, "posts", post.id, "comments"), {
      text,
      authorId: user.uid,
      authorName: user.displayName || "User",
      authorPhotoURL: user.photoURL || null,
      createdAt: new Date()
    });

    // 🔔 COMMENT NOTIFICATION
    if (post.authorId !== user.uid) {
      await addDoc(collection(db, "notifications"), {
        toUserId: post.authorId,
        fromUserId: user.uid,
        fromName: user.displayName || "Someone",
        fromPhotoURL: user.photoURL || null,
        type: "comment",
        postId: post.id,
        postPreview: text.slice(0, 60),
        read: false,
        createdAt: new Date()
      });
    }

    setText("");
  };

  const deleteComment = async (id) => {
    await deleteDoc(doc(db, "posts", post.id, "comments", id));
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div className="w-full max-w-xl overflow-hidden bg-white shadow-xl rounded-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold">Post</span>
          <button onClick={onClose}><X /></button>
        </div>

        {/* POST */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-2">
            {post.authorPhotoURL ? (
              <img
                src={post.authorPhotoURL}
                className="object-cover rounded-full w-9 h-9"
                alt=""
              />
            ) : (
              <div className="flex items-center justify-center bg-gray-200 rounded-full w-9 h-9">
                <User size={16} />
              </div>
            )}
            <div>
              <div className="font-medium">{post.authorName}</div>
              <div className="text-xs text-gray-400">
                {timeAgo(post.createdAt)}
              </div>
            </div>
          </div>

          <p className="mb-3 whitespace-pre-wrap">{post.content}</p>

          {/* REACTIONS */}
          <div className="flex gap-3">
            {["relate", "support"].map(type => {
              const active = post.reactions[type].users.includes(user?.uid);
              return (
                <button
                  key={type}
                  onClick={() => toggleReaction(type)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    active
                      ? "bg-purple-100 text-purple-600 font-semibold"
                      : "bg-gray-100 text-gray-600 hover:bg-purple-50"
                  }`}
                >
                  {type === "relate" ? "💙 I relate" : "🤍 Support"}{" "}
                  {post.reactions[type].count}
                </button>
              );
            })}
          </div>
        </div>

        {/* COMMENTS */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2 text-sm">
              {c.authorPhotoURL ? (
                <img
                  src={c.authorPhotoURL}
                  className="object-cover rounded-full w-7 h-7"
                  alt=""
                />
              ) : (
                <div className="bg-gray-200 rounded-full w-7 h-7" />
              )}

              <div className="flex-1">
                <span className="font-medium">{c.authorName}</span>{" "}
                {c.text}
                <div className="flex gap-2 text-xs text-gray-400">
                  {timeAgo(c.createdAt)}
                  {user?.uid === c.authorId && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ADD COMMENT */}
        {user && (
          <div className="flex gap-2 p-4 border-t">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 px-3 py-2 text-sm border rounded-full"
            />
            <button
              onClick={addComment}
              className="font-semibold text-purple-500"
            >
              Post
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PostModal;
