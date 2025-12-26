import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./Pages/home";
import Quiz from "./Pages/quiz";
import Bot from "./Pages/bot";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mental-check" element={<Quiz />} />
        <Route path="/chatbot" element={<Bot />} />
      </Routes>
    </Router>
  );
}
