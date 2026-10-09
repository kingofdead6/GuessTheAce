import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import Setup from "./components/Setup.jsx";
import Game from "./components/Game.jsx";
import Results from "./components/Results.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import NotFound from "./components/NotFound.jsx";
import { Background } from "./components/Decor.jsx";

// Simple hash routes: #/  #/play?level=ace  #/leaderboard
function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [path, query = ""] = raw.split("?");
  const params = new URLSearchParams(query);
  const clean = path.replace(/\/+$/, "");
  const routes = { "": "home", play: "play", leaderboard: "leaderboard" };
  const route = routes[clean] || "notfound";
  return { route, level: params.get("level"), path: clean };
}

export default function App() {
  const [{ route, level: hashLevel, path }, setLocation] = useState(parseHash);
  const [screen, setScreen] = useState("setup"); // setup | game | results
  const [settings, setSettings] = useState(null);
  const [result, setResult] = useState(null);
  const [gameId, setGameId] = useState(0);
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    const onHash = () => {
      const next = parseHash();
      setLocation(next);
      if (next.route === "play") setScreen("setup");
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const titles = { home: "Guess the Ace", play: "Play | Guess the Ace", leaderboard: "Leaderboard | Guess the Ace", notfound: "Page not found | Guess the Ace" };
    document.title = titles[route];
  }, [route]);

  const startGame = (s) => {
    setSettings(s);
    setGameId((n) => n + 1);
    setScreen("game");
    window.scrollTo({ top: 0 });
  };

  let page;
  if (route === "home") page = <Home />;
  else if (route === "notfound") page = <NotFound path={path} />;
  else if (route === "leaderboard")
    page = <Leaderboard highlightId={highlightId} initialLevel={result?.level} />;
  else if (screen === "game" && settings)
    page = (
      <Game
        key={gameId}
        series={settings.series}
        level={settings.level}
        onQuit={() => setScreen("setup")}
        onFinish={(r) => {
          setResult(r);
          setScreen("results");
          window.scrollTo({ top: 0 });
        }}
      />
    );
  else if (screen === "results" && result)
    page = (
      <Results
        key={gameId}
        result={result}
        onSaved={(record) => setHighlightId(record.id)}
        onPlayAgain={(same) => (same ? startGame(settings) : setScreen("setup"))}
      />
    );
  else page = <Setup key={hashLevel || "setup"} initialLevel={hashLevel || settings?.level} onStart={startGame} />;

  return (
    <MotionConfig reducedMotion="user">
      <Background />
      <Navbar route={route} inGame={route === "play" && screen === "game"} />
      {page}
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-mist sm:px-6">
        A fan-made quiz. Blue Lock and Haikyuu!! belong to their creators and publishers.
      </footer>
    </MotionConfig>
  );
}
