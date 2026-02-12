import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Heart, MessageCircle } from "lucide-react";
import { timeAgo } from "../utils/timeAgo";
import { useNavigate } from "react-router-dom";

const NotificationsDropdown = ({ open, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !open) return;

    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [user, open]);

  const handleClick = async (notif) => {
    await updateDoc(doc(db, "notifications", notif.id), {
      read: true
    });

    onClose();

    // 🔑 OPEN POST MODAL
    navigate(`/community?post=${notif.postId}`);
  };

  const renderText = (n) => {
    switch (n.type) {
      case "support":
        return "sent you support";
      case "relate":
        return "related to your post";
      case "comment":
        return "commented on your post";
      default:
        return "interacted with your post";
    }
  };

  const renderIcon = (n) => {
    if (n.type === "support" || n.type === "relate") {
      return <Heart className="mt-1 text-pink-500" size={18} />;
    }
    return <MessageCircle className="mt-1 text-purple-500" size={18} />;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute right-0 z-50 mt-3 overflow-hidden bg-white shadow-xl w-80 rounded-2xl"
        >
          <div className="px-4 py-3 font-semibold border-b">
            Notifications
          </div>

          {notifications.length === 0 && (
            <div className="p-4 text-sm text-center text-gray-500">
              No notifications yet 🌱
            </div>
          )}

          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full flex gap-3 px-4 py-3 text-left hover:bg-gray-50 ${
                !n.read ? "bg-purple-50" : ""
              }`}
            >
              {renderIcon(n)}

              <div className="text-sm">
                <div>
                  <span className="font-medium">{n.fromName}</span>{" "}
                  {renderText(n)}
                </div>
                <div className="text-xs text-gray-500">
                  {n.postPreview} · {timeAgo(n.createdAt)}
                </div>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsDropdown;
