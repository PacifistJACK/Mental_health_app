import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Heart,
  Smile,
  Sun,
  Star,
  Cloud,
  Flower,
  Leaf
} from "lucide-react";

const Bot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your mental health companion. How are you feeling today?",
      sender: "bot"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);
  const messagesEndRef = useRef(null);

  /* Floating background elements */
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

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Send message */
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user"
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("https://mental-health-app-backend-29tk.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage.text })
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.text,
        sender: "bot"
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "⚠️ Sorry, something went wrong with the AI backend.",
          sender: "bot"
        }
      ]);
      console.error(error);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Floating Background */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute ${element.color} ${element.size}`}
          style={{ left: `${element.x}%`, top: `${element.y}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut"
          }}
        >
          <element.icon />
        </motion.div>
      ))}

      {/* Chat Container */}
      <div className="relative z-10 flex flex-col h-screen max-w-4xl mx-auto">
        {/* Header */}
        <motion.header
          className="bg-white/80 backdrop-blur-sm border-b border-purple-100 p-6 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Mental Health Companion
              </h1>
              <p className="text-gray-600 text-sm">
                Here to support and uplift you
              </p>
            </div>
          </div>
        </motion.header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <p className="text-sm bg-white/70 p-3 rounded-2xl shadow">
                  {message.text}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-white/80 px-4 py-3 rounded-2xl shadow-md flex space-x-2">
                <motion.div className="w-2 h-2 bg-purple-500 rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
                <motion.div className="w-2 h-2 bg-pink-500 rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                <motion.div className="w-2 h-2 bg-indigo-500 rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div
          className="p-6 bg-white/80 backdrop-blur-sm border-t border-purple-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share how you're feeling..."
              className="flex-1 px-4 py-3 bg-white/90 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            I'm here to listen and support you ❤️
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Bot;
