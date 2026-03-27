import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  ArrowLeft,
  Droplets,
  Leaf,
  Maximize2,
  Sparkles
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AnimatedNavbar from "../components/AnimatedNavbar";

const games = [
  {
    id: "zen-bonsai",
    title: "Zen Bonsai",
    description:
      "Nurture a digital bonsai with water, sunlight, and patient care.",
    accent: "from-emerald-500 to-cyan-500",
    pill: "Care and grow",
    Icon: Leaf,
    url: `${process.env.PUBLIC_URL}/ZenBonsai-Game/index.html`
  },
  {
    id: "pebble-pond",
    title: "Pebble Pond",
    description:
      "Drop pebbles into still water and watch the ripples settle your pace.",
    accent: "from-sky-500 to-blue-600",
    pill: "Ripples and stillness",
    Icon: Droplets,
    url: `${process.env.PUBLIC_URL}/PebblePond/pebble-pond.html`
  },
  {
    id: "zen-sand-garden",
    title: "Zen Sand Garden",
    description:
      "Rake patterns, place stones, and shape a calm space stroke by stroke.",
    accent: "from-amber-400 to-orange-500",
    pill: "Patterns and focus",
    Icon: Sparkles,
    url: `${process.env.PUBLIC_URL}/ZenSandGarden/zen-sand-garden.html`
  }
];

const PlayArena = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  const selectedGame = games.find((game) => game.id === gameId);

  if (selectedGame) {
    const GameIcon = selectedGame.Icon;

    return (
      <div className="fixed inset-0 bg-slate-950">
        <iframe
          title={selectedGame.title}
          src={selectedGame.url}
          className="w-full h-full border-0"
          allowFullScreen
        />

        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-3 pointer-events-none">
          <Link
            to="/play-arena"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full shadow-lg pointer-events-auto bg-slate-900/75 backdrop-blur-md hover:bg-slate-900/90"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Arena
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full pointer-events-auto bg-slate-900/70 backdrop-blur-md">
            <GameIcon className="w-4 h-4" />
            {selectedGame.title}
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-full">
                  <Sparkles className="w-4 h-4" />
                  Play Arena
                </div>

                <h1 className="mb-3 text-4xl font-bold text-gray-800 md:text-5xl">
                  Pick A Calm Game
                </h1>

                <p className="text-base leading-relaxed text-gray-600 md:text-lg">
                  Choose a mindful mini-game, then it opens in full screen so
                  you can settle in without distractions.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-full shadow-sm">
                <Maximize2 className="w-4 h-4 text-cyan-600" />
                Full-screen launch
              </div>
            </div>
          </motion.section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game, index) => {
              const GameIcon = game.Icon;

              return (
                <motion.article
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="relative overflow-hidden border shadow-xl group rounded-3xl border-white/60 bg-white/85 backdrop-blur-xl"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${game.accent} opacity-10 transition-opacity duration-300 group-hover:opacity-20`}
                  />

                  <div className="relative p-6">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 mb-5 text-white rounded-2xl bg-gradient-to-br ${game.accent}`}
                    >
                      <GameIcon className="w-7 h-7" />
                    </div>

                    <div className="mb-3">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold tracking-wide text-gray-700 uppercase bg-gray-100 rounded-full">
                        {game.pill}
                      </span>
                    </div>

                    <h2 className="mb-3 text-2xl font-bold text-gray-800">
                      {game.title}
                    </h2>

                    <p className="mb-6 leading-relaxed text-gray-600">
                      {game.description}
                    </p>

                    <button
                      onClick={() => navigate(`/play-arena/${game.id}`)}
                      className={`inline-flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition rounded-2xl bg-gradient-to-r ${game.accent} hover:shadow-lg`}
                    >
                      <Maximize2 className="w-4 h-4" />
                      Play Full Screen
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
};

export default PlayArena;
