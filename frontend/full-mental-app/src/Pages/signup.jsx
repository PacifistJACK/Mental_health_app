import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createUserDoc } from "../utils/createUserDoc";
import { auth } from "../firebase";

const Signup = () => {
  const { signupWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignup = async () => {
    try {
      setError("");
      await signupWithEmail(email, password);
      await createUserDoc({
        ...auth.currentUser,
        displayName: name
      });
      navigate("/community");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError("");
      await loginWithGoogle();
      await createUserDoc(auth.currentUser);
      navigate("/community");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-8 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl"
      >
        <h1 className="mb-2 text-3xl font-bold text-center">
          Create Account ✨
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Join a safe and supportive community
        </p>

        {error && (
          <p className="mb-4 text-sm text-center text-red-500">{error}</p>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div className="relative">
            <User className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              type="text"
              placeholder="Your name"
              className="w-full py-3 pl-12 pr-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              type="email"
              placeholder="Email"
              className="w-full py-3 pl-12 pr-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              type="password"
              placeholder="Password"
              className="w-full py-3 pl-12 pr-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEmailSignup}
            className="w-full py-3 font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-pink-400 to-purple-500"
          >
            Sign Up
          </motion.button>

          <div className="text-sm text-center text-gray-400">or</div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleSignup}
            className="flex justify-center w-full py-3 bg-white border rounded-full shadow"
          >
            Continue with Google
          </motion.button>

          <p className="mt-4 text-sm text-center text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-purple-500 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
