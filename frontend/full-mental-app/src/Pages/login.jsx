import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.9-6.9C35.9 2.4 30.4 0 24 0 14.6 0 6.6 5.4 2.7 13.3l8.4 6.5C13.1 13.2 18.1 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 7-9.9 7-16.6z"/>
    <path fill="#FBBC05" d="M11.1 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3l-8.4-6.5C.9 16.6 0 20.2 0 24s.9 7.4 2.7 10.8l8.4-6.5z"/>
    <path fill="#34A853" d="M24 48c6.4 0 11.9-2.1 15.9-5.7l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-5.9 0-10.9-3.7-12.9-8.8l-8.4 6.5C6.6 42.6 14.6 48 24 48z"/>
  </svg>
);

const Login = () => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      await loginWithEmail(email, password);
      navigate("/community");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl"
      >
        <h1 className="mb-2 text-3xl font-bold text-center">Welcome Back 💜</h1>
        <p className="mb-6 text-center text-gray-600">
          We’re glad you’re here again
        </p>

        {error && (
          <p className="mb-4 text-sm text-center text-red-500">{error}</p>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              type="email"
              placeholder="Email"
              className="w-full py-3 pl-12 pr-4 border rounded-full focus:ring-2 focus:ring-purple-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              type="password"
              placeholder="Password"
              className="w-full py-3 pl-12 pr-4 border rounded-full focus:ring-2 focus:ring-purple-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="w-full py-3 font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-pink-400 to-purple-500"
          >
            Login
          </motion.button>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="flex-1 h-px bg-gray-300" />
            OR
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={loginWithGoogle}
            className="flex items-center justify-center w-full gap-3 py-3 bg-white border rounded-full shadow"
          >
            <GoogleIcon />
            <span className="font-medium text-gray-700">
              Continue with Google
            </span>
          </motion.button>

          <p className="mt-4 text-sm text-center text-gray-600">
            New here?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-purple-500 cursor-pointer hover:underline"
            >
              Create an account
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
