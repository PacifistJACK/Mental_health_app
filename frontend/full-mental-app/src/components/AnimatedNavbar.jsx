import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AnimatedNavbar = ({ scrolled, menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const handleSignup = () => {
    setMenuOpen(false);
    navigate("/signup");
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

        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Heart className="w-5 h-5 text-pink-500" />
          <span>MindfulSpace</span>
        </div>

        {/* Desktop Buttons */}
        <div className="items-center hidden gap-4 md:flex">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="text-gray-700 transition hover:text-gray-900"
          >
            Login
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignup}
            className="px-5 py-2 text-white rounded-full shadow bg-gradient-to-r from-pink-400 to-purple-500"
          >
            Sign Up
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="text-gray-700 md:hidden"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 pb-4 md:hidden bg-white/80 backdrop-blur-sm"
          >
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogin}
                className="py-2 text-left text-gray-700"
              >
                Login
              </button>
              <button
                onClick={handleSignup}
                className="py-2 text-white rounded-full bg-gradient-to-r from-pink-400 to-purple-500"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default AnimatedNavbar;
