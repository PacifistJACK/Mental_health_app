import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ExternalLink, Gamepad2, Leaf, Sparkles } from "lucide-react";
import AnimatedNavbar from "../components/AnimatedNavbar";

const gameUrl = `${process.env.PUBLIC_URL}/ZenBonsai-Game/index.html`;

const PlayArena = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
      <AnimatedNavbar
        scrolled={scrolled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main className="relative z-10 px-4 pt-28 pb-12">
        <div className="max-w-6xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 mb-8 border shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl border-white/60 md:p-8"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-full">
                  <Leaf className="w-4 h-4" />
                  Zen Bonsai
                </div>

                <h1 className="mb-3 text-4xl font-bold text-gray-800 md:text-5xl">
                  Play Arena
                </h1>

                <p className="text-base leading-relaxed text-gray-600 md:text-lg">
                  Take a quiet break and nurture your digital bonsai. The game
                  runs inside MindfulSpace, and your progress stays saved in the
                  browser between visits.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-full shadow-sm">
                  <Gamepad2 className="w-4 h-4 text-cyan-600" />
                  Mini game
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-full shadow-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Calming experience
                </div>
                <a
                  href={gameUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition shadow-sm rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Full View
                </a>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="overflow-hidden border shadow-2xl rounded-[2rem] border-white/60 bg-white/70 backdrop-blur-xl"
          >
            <iframe
              title="Zen Bonsai Game"
              src={gameUrl}
              className="block w-full border-0 h-[82vh] min-h-[640px]"
            />
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default PlayArena;
