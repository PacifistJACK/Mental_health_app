import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import PostModal from "./PostModal";
import { timeAgo } from "../utils/timeAgo";
import { Trash2 } from "lucide-react";

const CommentSection = ({ postId, post }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [openModal, setOpenModal] = useState(false);

  /* FETCH COMMENTS */
  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [postId]);

  /* ADD COMMENT + NOTIFICATION */
  const addComment = async () => {
    if (!user || !text.trim()) return;

    const commentText = text;

    await addDoc(collection(db, "posts", postId, "comments"), {
      text: commentText,
      authorId: user.uid,
      authorName: user.displayName || "User",
      authorPhotoURL: user.photoURL || null,
      createdAt: new Date()
    });

    // 🔔 COMMENT NOTIFICATION (no self notification)
    if (post.authorId !== user.uid) {
      await addDoc(collection(db, "notifications"), {
        toUserId: post.authorId,
        fromUserId: user.uid,
        fromName: user.displayName || "Someone",
        fromPhotoURL: user.photoURL || null,
        type: "comment",
        postId,
        postPreview: commentText.slice(0, 60),
        read: false,
        createdAt: new Date()
      });
    }

    setText("");
  };

  /* DELETE COMMENT */
  const deleteComment = async (id) => {
    await deleteDoc(doc(db, "posts", postId, "comments", id));
  };

  return (
    <>
      {/* INLINE COMMENTS (MAX 3) */}
      <div className="mt-3 space-y-2">
        {comments.slice(0, 3).map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            {c.authorPhotoURL ? (
              <img
                src={c.authorPhotoURL}
                className="object-cover w-6 h-6 rounded-full"
                alt=""
              />
            ) : (
              <div className="w-6 h-6 bg-gray-200 rounded-full" />
            )}

            <div className="flex-1">
              <span className="font-medium">{c.authorName}</span>{" "}
              {c.text}
              <div className="flex gap-2 text-xs text-gray-400">
                {timeAgo(c.createdAt)}
                {user?.uid === c.authorId && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* VIEW ALL */}
        {comments.length > 3 && (
          <button
            onClick={() => setOpenModal(true)}
            className="text-sm text-purple-500 hover:underline"
          >
            View all {comments.length} comments
          </button>
        )}
      </div>

      {/* ADD COMMENT INPUT */}
      {user && (
        <div className="flex gap-2 mt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 px-3 py-1 text-sm border rounded-full"
          />
          <button
            onClick={addComment}
            className="text-sm font-semibold text-purple-500"
          >
            Post
          </button>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {openModal && (
          <PostModal
            post={post}
            comments={comments}
            onClose={() => setOpenModal(false)}
            onDeleteComment={deleteComment}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CommentSection;
