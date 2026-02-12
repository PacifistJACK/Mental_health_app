import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createUserDoc } from "../utils/createUserDoc";
import { auth } from "../firebase";

const Login = () => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async () => {
    try {
      setError("");
      await loginWithEmail(email, password);
      await createUserDoc(auth.currentUser);
      navigate("/community");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
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
    <div>
    
    <div className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-8 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl"
      >
        <h1 className="mb-2 text-3xl font-bold text-center">
          Welcome Back 💜
        </h1>
        <p className="mb-6 text-center text-gray-600">
          We’re glad to see you again
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
              className="w-full py-3 pl-12 pr-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

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
            onClick={handleEmailLogin}
            className="w-full py-3 font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-pink-400 to-purple-500"
          >
            Login
          </motion.button>

          <div className="text-sm text-center text-gray-400">or</div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            className="flex justify-center w-full py-3 bg-white border rounded-full shadow"
          >
            Continue with Google
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
    </div>
  );
};

export default Login;
