import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Heart,
  Smile,
  Sun,
  Star,
  Cloud,
  Flower,
  Leaf,
  Brain,
  MessageCircle,
  Gamepad
} from "lucide-react";
import AnimatedNavbar from "../components/AnimatedNavbar";

/* Shield Icon */
const Shield = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Home = () => {
  const navigate = useNavigate();

  /* ✅ NAVBAR STATE — MOVED INSIDE COMPONENT */
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  const [floatingElements, setFloatingElements] = useState([]);

  /* Floating Icons Setup */
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

    for (let i = 0; i < 30; i++) {
      const elementType =
        elementTypes[Math.floor(Math.random() * elementTypes.length)];
      elements.push({
        id: i,
        ...elementType,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.4
      });
    }

    setFloatingElements(elements);
  }, []);

  /* Feature Cards */
  const features = [
    {
      id: 1,
      title: "Mental Health Check",
      description:
        "Assess your mental well-being with our comprehensive evaluation tool",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      status: "available",
      route: "/mental-check"
    },
    {
      id: 2,
      title: "Mental Health bot",
      description:
        "Get instant support and guidance from our AI-powered mental health assistant",
      icon: MessageCircle,
      color: "from-blue-500 to-cyan-500",
      status: "available",
      route: "/chatbot"
    },
    {
      id: 3,
      title: "Community Support",
      description:
        "Connect with others and share experiences in a safe environment",
      icon: Heart,
      color: "from-green-400 to-lime-500",
      status: "available",
      route: "/community"
    },
    {
      id: 4,
      title: "Play Arena",
      description:
        "Take a mindful break with Zen Bonsai and other calming mini-games",
      icon: Gamepad,
      color: "from-blue-400 to-purple-500",
      status: "available",
      route: "/play-arena"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50">

      {/* ✅ NAVBAR */}
      <AnimatedNavbar
        scrolled={scrolled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Floating Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => {
          const IconComponent = element.icon;
          return (
            <motion.div
              key={element.id}
              className={`absolute ${element.color} ${element.size}`}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                opacity: element.opacity
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: element.duration,
                repeat: Infinity,
                delay: element.delay,
                ease: "easeInOut"
              }}
            >
              <IconComponent />
            </motion.div>
          );
        })}
      </div>

      {/* MAIN CONTENT */}
      <div className="container relative z-10 px-4 py-8 mx-auto">
        {/* HEADER */}
        <header className="pt-8 mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-800 md:text-6xl">
            Mind
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              ful
            </span>
            Space
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Your journey to better mental health starts here.
          </p>
        </header>

        {/* FEATURE CARDS */}
        <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 ${
                  feature.status === "available"
                    ? "cursor-pointer"
                    : "opacity-75"
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-20`}
                ></div>

                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {feature.status === "coming-soon" && (
                    <span className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full">
                      Coming Soon
                    </span>
                  )}

                  <h3 className="mb-2 text-xl font-semibold text-gray-800">
                    {feature.title}
                  </h3>

                  <p className="mb-6 text-sm text-gray-600">
                    {feature.description}
                  </p>

                  <button
                    onClick={() =>
                      feature.status === "available" &&
                      navigate(feature.route)
                    }
                    className={`w-full py-2 rounded-xl font-semibold ${
                      feature.status === "available"
                        ? `bg-gradient-to-r ${feature.color} text-white`
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={feature.status !== "available"}
                  >
                    {feature.status === "available"
                      ? "Get Started"
                      : "Stay Tuned"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* INFO SECTION */}
        <div className="pb-12 mt-20 text-center">
          <div className="max-w-3xl p-8 mx-auto shadow-lg bg-white/70 backdrop-blur-sm rounded-2xl">
            <h2 className="mb-4 text-3xl font-bold text-gray-800">
              Your Mental Health Matters
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-gray-600">
              We're here to support your mental well-being.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-gray-600">
                <Heart className="w-5 h-5 mr-2 text-pink-500" />
                <span>Compassionate Care</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                <span>Evidence-Based Tools</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 🫧 Daily Mental Health Bubble */}
      <motion.div
        className="fixed z-50 bottom-6 right-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative flex items-center justify-center w-16 h-16 text-white rounded-full shadow-xl cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          onClick={() =>
            window.open("https://wellsense-frontend.onrender.com", "_blank")
          }
        >
          <Brain className="w-8 h-8" />

          {/* Pulse Effect */}
          <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-pink-400"></span>
        </motion.div>

        {/* Tooltip */}
        <div className="absolute px-3 py-1 text-sm text-white -translate-x-1/2 rounded-lg shadow-md -top-10 left-1/2 bg-black/70 whitespace-nowrap">
          Daily Check 🧠
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
