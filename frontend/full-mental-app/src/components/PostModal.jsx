import React from "react";
import { motion } from "framer-motion";
import { X, Trash2, User, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../utils/timeAgo";

const PostModal = ({ post, comments, onClose, onDeleteComment }) => {
  const { user } = useAuth();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-xl overflow-hidden bg-white shadow-xl rounded-2xl"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold">Post</span>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* POST */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-2">
            {post.anonymous ? (
              <div className="flex items-center justify-center bg-gray-200 rounded-full w-9 h-9">
                <User size={16} />
              </div>
            ) : post.authorPhotoURL ? (
              <img
                src={post.authorPhotoURL}
                className="object-cover rounded-full w-9 h-9"
                alt=""
              />
            ) : (
              <div className="flex items-center justify-center bg-purple-200 rounded-full w-9 h-9">
                <Heart size={14} />
              </div>
            )}

            <div>
              <div className="font-medium">{post.authorName}</div>
              <div className="text-xs text-gray-400">
                {timeAgo(post.createdAt)}
              </div>
            </div>
          </div>

          <p className="text-gray-800 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* COMMENTS */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {comments.map((c) => (
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
                      onClick={() => onDeleteComment(c.id)}
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
      </motion.div>
    </motion.div>
  );
};

export default PostModal;
