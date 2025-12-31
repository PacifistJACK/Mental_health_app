import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Smile, Sun, Star, Cloud, Flower, Leaf } from "lucide-react";

/* Questions */
const questions = [
  { id: 1, text: "How are you feeling today?", options: ["Very Positive", "Mostly Positive", "Mostly Negative", "Very Negative"] },
  { id: 2, text: "What's your current energy level?", options: ["High Energy", "Moderate Energy", "Low Energy", "Exhausted"] },
  { id: 3, text: "How satisfied are you with your relationships?", options: ["Very Satisfied", "Somewhat Satisfied", "Dissatisfied", "Very Dissatisfied"] },
  { id: 4, text: "How well are you managing stress lately?", options: ["Managing Very Well", "Managing Fairly Well", "Struggling Somewhat", "Struggling a Lot"] },
  { id: 5, text: "How would you rate your sleep quality?", options: ["Excellent", "Good", "Poor", "Very Poor"] },
  { id: 6, text: "How optimistic do you feel about tomorrow?", options: ["Very Optimistic", "Somewhat Optimistic", "Pessimistic", "Very Pessimistic"] },
  { id: 7, text: "How often do you feel grateful today?", options: ["Very Often", "Sometimes", "Rarely", "Almost Never"] },
  { id: 8, text: "How connected do you feel to others?", options: ["Very Connected", "Moderately Connected", "Somewhat Disconnected", "Very Disconnected"] },
  { id: 9, text: "How would you describe your overall mood?", options: ["Consistently Positive", "Generally Positive", "Generally Negative", "Consistently Negative"] },
  { id: 10, text: "How happy are you with your life?", options: ["Completely Happy", "Mostly Happy", "Somewhat Unhappy", "Completely Unhappy"] },
];

/* Floating icons */
const FloatingElement = ({ delay = 0 }) => {
  const elementTypes = [
    { icon: Heart, color: "text-pink-400", size: "w-6 h-6" },
    { icon: Smile, color: "text-yellow-400", size: "w-6 h-6" },
    { icon: Sun, color: "text-orange-400", size: "w-8 h-8" },
    { icon: Star, color: "text-purple-400", size: "w-5 h-5" },
    { icon: Cloud, color: "text-blue-300", size: "w-7 h-7" },
    { icon: Flower, color: "text-pink-300", size: "w-6 h-6" },
    { icon: Leaf, color: "text-green-400", size: "w-5 h-5" }
  ];

  const element = elementTypes[Math.floor(Math.random() * elementTypes.length)];
  const Icon = element.icon;

  return (
    <motion.div
      className={`absolute pointer-events-none ${element.color}`}
      style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
      animate={{
        y: [0, -25, 0],
        x: [0, Math.random() * 20 - 10, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      <Icon className={element.size} />
    </motion.div>
  );
};

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState({
    condition: "",
    confidence: 0,
    anxiety_score: 0,
    depression_score: 0,
    risk_level: ""
  });

  const floatingArray = useMemo(() => [...Array(30)], []);

  const handleAnswerSelect = (index) => {
    const updated = [...answers];
    updated[currentQuestion] = index;
    setAnswers(updated);
  };

  /* Submit to FastAPI */
  const submitAnswers = async () => {
    try {
      const res = await fetch("https://mentalfitness210.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });

      const data = await res.json();
      setResult(data);  
      setShowResults(true);
    } catch (error) {
      console.error(error);
      setResult({
        condition: "Error",
        confidence: 0,
        anxiety_score: 0,
        depression_score: 0,
        risk_level: ""
      });
      setShowResults(true);
    }
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      submitAnswers();
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1);
  };

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers(Array(questions.length).fill(null));
    setShowResults(false);
    setResult({
      condition: "",
      confidence: 0,
      anxiety_score: 0,
      depression_score: 0,
      risk_level: ""
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  /* ================= RESULTS ================= */
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100 relative overflow-hidden">
        {floatingArray.map((_, i) => (
          <FloatingElement key={i} delay={i * 0.2} />
        ))}

        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50"
          >
            <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 p-8 text-center">
              <h1 className="text-3xl font-bold text-white">
                Your Mental Health Report
              </h1>
            </div>

            <div className="p-8 text-center space-y-4">
              <div><strong>Condition:</strong> {result.condition}</div>
              <div><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</div>
              <div><strong>Anxiety Score:</strong> {result.anxiety_score}</div>
              <div><strong>Depression Score:</strong> {result.depression_score}</div>
              <div><strong>Risk Level:</strong> {result.risk_level}</div>

              <button
                onClick={restart}
                className="mt-6 px-8 py-4 bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 text-white font-bold rounded-full shadow-lg hover:scale-105 transition"
              >
                Take Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ================= QUESTIONS ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100 relative overflow-hidden">
      {floatingArray.map((_, i) => (
        <FloatingElement key={i} delay={i * 0.1} />
      ))}

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50"
        >
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 p-6">
            <h1 className="text-3xl font-bold text-white">
              Mental Health Check-In 🧠
            </h1>
            <p className="text-white/90 mt-2">
              Let's explore your mental health!
            </p>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-6">
              {questions[currentQuestion].text}
            </h2>

            <div className="grid gap-4 mb-8">
              {questions[currentQuestion].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`p-4 rounded-xl border transition-all ${
                    answers[currentQuestion] === idx
                      ? "bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 text-white"
                      : "bg-white hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={goBack}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-gray-300 rounded-full disabled:opacity-40"
              >
                Back
              </button>

              <button
                onClick={goNext}
                disabled={answers[currentQuestion] === null}
                className="px-6 py-3 bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 text-white rounded-full disabled:opacity-40"
              >
                {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Quiz;
