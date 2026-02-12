import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Menu, X, User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";
import NotificationsDropdown from "./NotificationsDropdown";

const AnimatedNavbar = ({ scrolled, menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  /* LISTEN FOR UNREAD NOTIFICATIONS */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", user.uid),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });

    return () => unsub();
  }, [user]);

  /* HANDLE NOTIFICATION CLICK */
  const handleNotificationClick = async (notif) => {
    // mark as read
    await updateDoc(doc(db, "notifications", notif.id), {
      read: true
    });

    setNotifOpen(false);

    // open post modal via query param
    navigate(`/community?post=${notif.postId}`);
  };

  const handleLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const handleSignup = () => {
    setMenuOpen(false);
    navigate("/signup");
  };

  const handleProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        backgroundColor: scrolled
          ? "rgba(255,255,255,0.75)"
          : "rgba(255,255,255,0.55)",
        backdropFilter: scrolled ? "blur(14px)" : "blur(8px)",
        boxShadow: scrolled
          ? "0 10px 30px rgba(0,0,0,0.08)"
          : "0 4px 12px rgba(0,0,0,0.04)"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="flex items-center justify-between max-w-6xl px-4 py-4 mx-auto">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-semibold text-gray-800 cursor-pointer"
        >
          <Heart className="w-5 h-5 text-pink-500" />
          <span>MindfulSpace</span>
        </div>

        {/* DESKTOP */}
        <div className="items-center hidden gap-4 md:flex">
          {!user ? (
            <>
              <button
                onClick={handleLogin}
                className="text-gray-700 hover:text-gray-900"
              >
                Login
              </button>
              <button
                onClick={handleSignup}
                className="px-5 py-2 text-white rounded-full bg-gradient-to-r from-pink-400 to-purple-500"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              {/* NOTIFICATIONS */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs bg-pink-500 text-white rounded-full px-1.5">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <NotificationsDropdown
                  open={notifOpen}
                  onClose={() => setNotifOpen(false)}
                  onNotificationClick={handleNotificationClick}
                />
              </div>

              {/* PROFILE */}
              <div
                onClick={handleProfile}
                className="flex items-center gap-2 cursor-pointer"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    className="object-cover w-8 h-8 rounded-full"
                    alt=""
                  />
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                    <User size={16} />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.displayName || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 rounded-full"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </motion.header>
  );
};

export default AnimatedNavbar;
