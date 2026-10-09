import { useState } from "react";
import { motion } from "motion/react";
import { DIFFICULTIES, SERIES_FILTERS, poolFor, ROUNDS_PER_GAME } from "../lib/game.js";
import { Brush } from "./Decor.jsx";

function Choice({ selected, onSelect, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative text-left transition-colors ${
        selected ? "bg-ember text-ink" : "bg-chalk/[0.06] text-chalk hover:bg-chalk/[0.12]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function Setup({ initialLevel, onStart }) {
  const [series, setSeries] = useState("both");
  const [level, setLevel] = useState(DIFFICULTIES[initialLevel] ? initialLevel : "rookie");
  const rounds = Math.min(ROUNDS_PER_GAME, poolFor(series, level).length);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-32 sm:px-6">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="display relative text-[clamp(3.6rem,10vw,7rem)]"
      >
        Set up your game
        <Brush seed={5} color="var(--color-rally)" className="absolute -bottom-3 left-0 -z-10 h-10 w-2/3 opacity-80" />
      </motion.h1>

      <form
        className="mt-14 space-y-12"
        onSubmit={(e) => {
          e.preventDefault();
          onStart({ series, level });
        }}
      >
        <fieldset>
          <legend className="display mb-4 text-3xl">Which series?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {SERIES_FILTERS.map((s) => (
              <Choice
                key={s.id}
                selected={series === s.id}
                onSelect={() => setSeries(s.id)}
                className="cut px-5 py-4 font-medium"
              >
                {s.label}
              </Choice>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="display mb-4 text-3xl">How fast are you?</legend>
          <div className="grid gap-2">
            {Object.values(DIFFICULTIES).map((d) => (
              <Choice
                key={d.id}
                selected={level === d.id}
                onSelect={() => setLevel(d.id)}
                className="cut grid grid-cols-[4.5rem_1fr] items-center gap-4 px-5 py-4 sm:grid-cols-[5.5rem_1fr_auto]"
              >
                <span className="display text-6xl">{d.seconds}s</span>
                <span>
                  <span className="display block text-3xl">{d.label}</span>
                  <span className={`text-sm ${level === d.id ? "text-ink/80" : "text-chalk/70"}`}>{d.blurb}</span>
                </span>
                <span className={`hidden font-serif text-3xl sm:block ${level === d.id ? "text-ink/40" : "text-chalk/25"}`}>
                  {d.kanji}
                </span>
              </Choice>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-5">
          <button type="submit" className="btn btn-ember text-2xl">
            Start game
          </button>
          <p className="text-sm text-mist">
            {rounds} players, {DIFFICULTIES[level].seconds} seconds each.{" "}
            {DIFFICULTIES[level].answer === "choice"
              ? `Click a name or press 1–${DIFFICULTIES[level].options} to answer.`
              : "Type the name and press Enter. First or last name is enough."}
          </p>
        </div>
      </form>
    </main>
  );
}
