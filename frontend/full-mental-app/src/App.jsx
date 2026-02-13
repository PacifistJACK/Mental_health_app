import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./Pages/home";
import Quiz from "./Pages/quiz";
import Bot from "./Pages/bot";
import Community from "./Pages/community";
import AnimatedNavbar from "./components/AnimatedNavbar";
import Login from "./Pages/login";
import Signup from "./Pages/signup";
import Profile from "./Pages/profile";
import CreatePost from "./Pages/CreatePost";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mental-check" element={<Quiz />} />
        <Route path="/chatbot" element={<Bot />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/post" element={<CreatePost />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Routes>
    </Router>
  );
}
