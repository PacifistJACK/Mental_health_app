import React, { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent
} from "framer-motion";
import {
  Heart,
  Smile,
  Sun,
  Star,
  Cloud,
  Flower,
  Leaf,
  Menu,
  X,
  Users,
  MessageCircle
} from "lucide-react";

const Community = () => {
  const [floatingElements, setFloatingElements] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ================= FLOATING BACKGROUND ================= */
  useEffect(() => {
    const elements = [];
    const elementTypes = [
      { icon: Heart, color: "text-pink-400", size: "w-6 h-6" },
      { icon: Smile, color: "text-yellow-400", size: "w-6 h-6" },
      { icon: Sun, color: "text-orange-400", size: "w-8 h-8" },
      { icon: Star, color: "text-purple-400", size: "w-5 h-5" },
      { icon: Cloud, color: "text-blue-300", size: "w-7 h-7" },
      { icon: Flower, color: "text-pink-300", size: "w-6 h-6" },
      { icon: Leaf, color: "text-green-400", size: "w-5 h-5" }
    ];

    for (let i = 0; i < 15; i++) {
      const elementType =
        elementTypes[Math.floor(Math.random() * elementTypes.length)];
      elements.push({
        id: i,
        ...elementType,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 5
      });
    }
    setFloatingElements(elements);
  }, []);

  /* ================= NAVBAR SCROLL ANIMATION ================= */
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50">

      {/* ================= FLOATING BACKGROUND ================= */}
      {floatingElements.map((el) => {
        const Icon = el.icon;
        return (
          <motion.div
            key={el.id}
            className={`absolute ${el.color} ${el.size}`}
            style={{ left: `${el.x}%`, top: `${el.y}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: "easeInOut"
            }}
          >
            <Icon />
          </motion.div>
        );
      })}

      {/* ================= NAVBAR ================= */}
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
        className="fixed top-0 left-0 right-0 z-20"
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
              className="text-gray-700 transition hover:text-gray-900"
            >
              Login
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
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

        {/* ================= MOBILE MENU ================= */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-4 md:hidden bg-white/80 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-3">
                <button className="py-2 text-left text-gray-700">
                  Login
                </button>
                <button className="py-2 text-white rounded-full bg-gradient-to-r from-pink-400 to-purple-500">
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="relative z-10 px-4 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            Community Support 💬
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            A safe space to connect, share experiences, and support one another.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid max-w-5xl grid-cols-1 gap-8 mx-auto mt-16 md:grid-cols-3">
          {[Users, MessageCircle, Heart].map((Icon, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
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
      </main>
    </div>
  );
};

export default Community;
