import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. Import motion from framer-motion
import { motion } from "framer-motion"; 
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
  Zap
} from "lucide-react";

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
      title: "Mental Health Chatbot",
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
      route:"/community"
    },
    {
      id: 4,
      title: "The Rest Initiative",
      description:
        "Connect with others and share experiences in a safe environment",
      icon: Heart,
      color: "from-gray-400 to-gray-500",
      status: "coming-soon"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      
      {/* -------------------------------------------------- */}
      {/* UPDATED FLOATING BACKGROUND (Now using framer-motion) */}
      {/* -------------------------------------------------- */}
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
              // The animation logic matches Bot.jsx exactly
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
            Your journey to better mental health starts here. Discover tools and
            resources designed to support your well-being.
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
              We're here to provide you with the tools and support you need to
              take care of your mental well-being.
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
    </div>
  );
};

export default Home;