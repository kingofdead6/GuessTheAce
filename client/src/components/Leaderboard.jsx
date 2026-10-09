import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DIFFICULTIES, SERIES_FILTERS } from "../lib/game.js";
import { useScores } from "../lib/useScores.js";
import { Brush } from "./Decor.jsx";

const SERIES_TABS = [
  { id: "all", label: "All games" },
  ...SERIES_FILTERS.map((s) => (s.id === "both" ? { ...s, label: "Mixed" } : s)),
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function Leaderboard({ highlightId, initialLevel }) {
  const [level, setLevel] = useState(initialLevel || "rookie");
  const [series, setSeries] = useState("all");
  const { status, rows, error } = useScores({ difficulty: level, series, limit: 20 });

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6">
      <h1 className="display relative text-[clamp(3.6rem,11vw,8rem)]">
        Leaderboard
        <Brush seed={13} color="var(--color-rally)" className="absolute -bottom-4 left-0 -z-10 h-12 w-2/3 opacity-80" />
      </h1>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-6">
        <div role="tablist" aria-label="Level" className="flex gap-1">
          {Object.values(DIFFICULTIES).map((d) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={level === d.id}
              onClick={() => setLevel(d.id)}
              className={`relative px-4 pb-3 pt-1 transition-colors ${level === d.id ? "text-chalk" : "text-mist hover:text-chalk"}`}
            >
              <span className="display text-3xl">{d.label}</span>
              {level === d.id && (
                <motion.span layoutId="lb-tab" className="absolute inset-x-2 bottom-0 h-1 -skew-x-12 bg-ember" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 text-sm" aria-label="Series">
          {SERIES_TABS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeries(s.id)}
              aria-pressed={series === s.id}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                series === s.id ? "bg-chalk text-ink" : "bg-chalk/[0.06] text-chalk/80 hover:bg-chalk/[0.12]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass cut mt-6 overflow-hidden">
        {status === "loading" && rows.length === 0 ? (
          <p className="p-8 text-mist sm:p-12">Loading scores…</p>
        ) : status === "error" ? (
          <div className="p-8 sm:p-12">
            <p className="display text-4xl">Leaderboard unavailable</p>
            <p className="mt-2 text-chalk/70">{error} Try again in a moment.</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 sm:p-12">
            <p className="display text-4xl">No {DIFFICULTIES[level].label} scores yet</p>
            <p className="mt-2 text-chalk/70">Finish a game on this level and save your score to appear here.</p>
            <a href={`#/play?level=${level}`} className="btn btn-ember mt-6 inline-block">
              Play {DIFFICULTIES[level].label}
            </a>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="text-xs text-mist">
              <tr className="border-b border-chalk/10">
                <th scope="col" className="px-4 py-3 font-medium sm:px-6">Rank</th>
                <th scope="col" className="px-2 py-3 font-medium">Player</th>
                <th scope="col" className="hidden px-2 py-3 font-medium sm:table-cell">Series</th>
                <th scope="col" className="hidden px-2 py-3 font-medium md:table-cell">Correct</th>
                <th scope="col" className="hidden px-2 py-3 font-medium md:table-cell">Streak</th>
                <th scope="col" className="px-4 py-3 text-right font-medium sm:px-6">Score</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b border-chalk/5 last:border-0 ${r.id === highlightId ? "bg-ember/15" : ""}`}
                  >
                    <td className="px-4 py-3 sm:px-6">
                      <span className={`display text-3xl ${i === 0 ? "text-ember" : i < 3 ? "text-chalk" : "text-chalk/40"}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="max-w-[10rem] truncate px-2 py-3 font-medium">
                      {r.name}
                      <span className="block text-xs font-normal text-mist">{formatDate(r.date)}</span>
                    </td>
                    <td className="hidden px-2 py-3 text-sm text-chalk/80 sm:table-cell">
                      {SERIES_TABS.find((s) => s.id === r.series)?.label}
                    </td>
                    <td className="hidden px-2 py-3 text-sm tabular-nums md:table-cell">
                      {r.correct}/{r.total}
                    </td>
                    <td className="hidden px-2 py-3 text-sm tabular-nums md:table-cell">{r.bestStreak}</td>
                    <td className="display px-4 py-3 text-right text-3xl tabular-nums sm:px-6">
                      {r.score.toLocaleString("en-US")}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-6 text-sm text-mist">Scores are shared by everyone who plays.</p>
    </main>
  );
}
