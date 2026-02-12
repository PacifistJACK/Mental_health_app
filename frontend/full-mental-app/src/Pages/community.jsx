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
  MessageCircle
} from "lucide-react";
import AnimatedNavbar from "../components/AnimatedNavbar";

const Community = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);

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
      const el = elementTypes[Math.floor(Math.random() * elementTypes.length)];
      elements.push({
        id: i,
        ...el,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 5
      });
    }

    setFloatingElements(elements);
  }, []);

  /* ================= NAVBAR SCROLL EFFECT ================= */
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50">

      {/* Floating Background */}
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

      {/* Navbar (self-handling navigation) */}
      <AnimatedNavbar
        scrolled={scrolled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* ================= MAIN CONTENT ================= */}
      <main className="relative z-10 px-4 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            Community Support 💬
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            A safe place to connect, share experiences, and support each other.
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
