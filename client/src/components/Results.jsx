import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import SlotNumber from "./SlotNumber.jsx";
import { Brush } from "./Decor.jsx";
import { DIFFICULTIES, SERIES_FILTERS } from "../lib/game.js";
import { saveScore } from "../lib/leaderboard.js";
import CharacterPortrait from "./CharacterPortrait.jsx";

const NAME_KEY = "guess-the-ace.player-name";

function readName() {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

function verdict(correct, total) {
  const r = correct / total;
  if (r === 1) return "Perfect game";
  if (r >= 0.8) return "Ace performance";
  if (r >= 0.5) return "Solid starter";
  if (r > 0) return "Keep training";
  return "Back to the bench";
}

export default function Results({ result, onPlayAgain, onSaved }) {
  const reduce = useReducedMotion();
  const [name, setName] = useState(readName);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const diff = DIFFICULTIES[result.level];
  const seriesLabel = SERIES_FILTERS.find((s) => s.id === result.series)?.label;

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    const clean = name.trim().slice(0, 20);
    if (clean.length < 2) {
      setError("Enter a name with at least 2 characters.");
      return;
    }
    try {
      localStorage.setItem(NAME_KEY, clean);
    } catch {
      /* ignore */
    }
    setSaving(true);
    setError("");
    try {
      setSaved(
        await saveScore({
          name: clean,
          score: result.score,
          correct: result.correct,
          total: result.total,
          bestStreak: result.bestStreak,
          difficulty: result.level,
          series: result.series,
        }),
      );
    } catch (err) {
      setError(`${err.message} Your score wasn't saved, try again.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6">
      <p className="text-mist">
        {diff.label}, {seriesLabel}
      </p>
      <motion.h1
        initial={reduce ? false : { y: -80, opacity: 0, rotate: -3 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 14 }}
        className="display relative mt-2 text-[clamp(3.6rem,11vw,8rem)]"
      >
        {verdict(result.correct, result.total)}
        <Brush seed={9} className="absolute -bottom-4 left-0 -z-10 h-12 w-3/4" />
      </motion.h1>

      <div className="mt-14 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="glass cut p-6 sm:p-8">
          <p className="text-sm text-mist">Final score</p>
          <SlotNumber value={result.score} minDigits={4} className="display text-[clamp(5rem,14vw,8.5rem)] text-ember" />
          <dl className="mt-6 grid grid-cols-2 gap-6 border-t border-chalk/10 pt-6">
            <div>
              <dt className="text-sm text-mist">Correct</dt>
              <dd className="display text-5xl">
                {result.correct}
                <span className="text-chalk/40">/{result.total}</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-mist">Best streak</dt>
              <dd className="display text-5xl">{result.bestStreak}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-6">
          {saved ? (
            <div className="glass cut p-6 sm:p-8">
              <p className="text-sm text-mist">Saved to the leaderboard</p>
              <p className="display mt-2 text-5xl">
                {saved.rank ? `Rank #${saved.rank}` : "Saved"}
                <span className="block text-2xl text-chalk/50">in {diff.label}</span>
              </p>
              <a href="#/leaderboard" onClick={() => onSaved(saved.record)} className="btn btn-ghost mt-6 inline-block">
                Open leaderboard
              </a>
            </div>
          ) : (
            <form onSubmit={save} className="glass cut p-6 sm:p-8" noValidate>
              <label htmlFor="player-name" className="display block text-3xl">
                Save your score
              </label>
              <p className="mt-1 text-sm text-mist">Your name shows on the shared leaderboard.</p>
              <input
                id="player-name"
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="nickname"
                aria-invalid={!!error}
                aria-describedby={error ? "name-error" : undefined}
                className="mt-4 w-full border-b-2 border-chalk/20 bg-chalk/[0.06] px-4 py-3 text-lg outline-none placeholder:text-chalk/30 focus:border-ember"
              />
              {error && (
                <p id="name-error" className="mt-2 text-sm text-miss">
                  {error}
                </p>
              )}
              <button type="submit" disabled={saving} className="btn btn-ember mt-5 disabled:opacity-60">
                {saving ? "Saving…" : "Save score"}
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => onPlayAgain(true)} className="btn btn-ember">
              Play again
            </button>
            <button type="button" onClick={() => onPlayAgain(false)} className="btn btn-ghost">
              Change level
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="display text-4xl">Your players</h2>
        <ol className="mt-4 divide-y divide-chalk/10 border-y border-chalk/10">
          {result.history.map((h, i) => (
            <li key={h.id} className="flex items-center gap-4 py-3">
              <span className="display w-8 text-2xl text-chalk/40">{i + 1}</span>
              <CharacterPortrait id={h.id} name={h.name} size="sm" ring={h.correct ? "win" : "miss"} />
              <span className="flex-1 font-medium">{h.name}</span>
              <span className={`text-sm tabular-nums ${h.correct ? "text-chalk" : "text-mist"}`}>
                {h.correct ? `+${h.points.toLocaleString("en-US")}` : "Missed"}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
