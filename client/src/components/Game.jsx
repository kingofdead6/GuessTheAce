import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { DIFFICULTIES, buildRounds, scoreRound, isCorrectGuess } from "../lib/game.js";
import { SERIES } from "../data/characters.js";
import SlotNumber from "./SlotNumber.jsx";
import { Brush } from "./Decor.jsx";
import CharacterPortrait from "./CharacterPortrait.jsx";

function TimerRing({ secondsLeft, total }) {
  const r = 88;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, secondsLeft / total);
  const danger = secondsLeft <= 5;
  return (
    <div className="relative h-36 w-36 shrink-0 sm:h-56 sm:w-56" role="timer" aria-live="off">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-chalk/10" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke={danger ? "var(--color-miss)" : "var(--color-ember)"}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <SlotNumber
          value={Math.ceil(secondsLeft)}
          minDigits={2}
          className={`display text-[4rem] sm:text-[6.5rem] ${danger ? "text-miss" : "text-chalk"}`}
        />
        <span className="-mt-1 text-xs text-mist">seconds</span>
      </div>
    </div>
  );
}

export default function Game({ series, level, onFinish, onQuit }) {
  const diff = DIFFICULTIES[level];
  const reduce = useReducedMotion();
  const rounds = useMemo(() => buildRounds(series, level), [series, level]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("playing"); // playing | revealed
  const [elapsed, setElapsed] = useState(0);
  const [manualClues, setManualClues] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [outcome, setOutcome] = useState(null); // { correct, points, reason, picked }
  const [guess, setGuess] = useState("");
  const [triesLeft, setTriesLeft] = useState(diff.attempts || 1);
  const [shakeKey, setShakeKey] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState([]);

  const startRef = useRef(performance.now());
  const nextBtnRef = useRef(null);
  const inputRef = useRef(null);

  const round = rounds[index];
  const secondsLeft = Math.max(0, diff.seconds - elapsed);
  const autoClues = 1 + Math.floor(elapsed / diff.clueEvery);
  const cluesShown = phase === "revealed" ? 4 : Math.min(4, Math.max(autoClues, manualClues));

  const finishRound = useCallback(
    ({ correct, reason, picked = null }) => {
      const left = Math.floor(Math.max(0, diff.seconds - (performance.now() - startRef.current) / 1000));
      const points = correct
        ? scoreRound({ difficultyId: level, secondsLeft: left, cluesSeen: cluesShown, streak })
        : 0;
      const newStreak = correct ? streak + 1 : 0;
      setScore((s) => s + points);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setHistory((h) => [...h, { id: round.answer.id, name: round.answer.name, correct, points }]);
      setOutcome({ correct, points, reason, picked, clues: cluesShown, left: Math.max(0, diff.seconds - (performance.now() - startRef.current) / 1000) });
      setPhase("revealed");
    },
    [diff.seconds, level, cluesShown, streak, round],
  );

  // Clock
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      const e = (performance.now() - startRef.current) / 1000;
      setElapsed(e);
    }, 100);
    return () => clearInterval(t);
  }, [phase, index]);

  useEffect(() => {
    if (phase === "playing" && secondsLeft <= 0) finishRound({ correct: false, reason: "time" });
  }, [secondsLeft, phase, finishRound]);

  // Focus management
  useEffect(() => {
    if (phase === "revealed") nextBtnRef.current?.focus();
    else if (diff.answer === "type") inputRef.current?.focus();
  }, [phase, index, diff.answer]);

  const goNext = useCallback(() => {
    if (index + 1 >= rounds.length) {
      onFinish({
        score,
        correct: history.filter((h) => h.correct).length,
        total: rounds.length,
        bestStreak,
        history,
        series,
        level,
      });
      return;
    }
    setIndex((i) => i + 1);
    setPhase("playing");
    setElapsed(0);
    setManualClues(1);
    setOutcome(null);
    setGuess("");
    setTriesLeft(diff.attempts || 1);
    setWrongGuesses([]);
    startRef.current = performance.now();
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [index, rounds.length, onFinish, score, history, bestStreak, series, level, diff.attempts, reduce]);

  // Keyboard: number keys pick an option, Enter goes to the next player
  useEffect(() => {
    const onKey = (e) => {
      if (phase === "playing" && diff.answer === "choice") {
        const n = Number(e.key);
        if (n >= 1 && n <= round.options.length) {
          const pick = round.options[n - 1];
          finishRound({ correct: pick.id === round.answer.id, reason: "pick", picked: pick.id });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, diff.answer, round, finishRound]);

  const submitGuess = (e) => {
    e.preventDefault();
    if (phase !== "playing" || guess.trim().length < 2) return;
    if (isCorrectGuess(guess, round.answer)) {
      finishRound({ correct: true, reason: "typed" });
    } else {
      const left = triesLeft - 1;
      setWrongGuesses((w) => [...w, guess.trim()]);
      setGuess("");
      setShakeKey((k) => k + 1);
      if (left <= 0) finishRound({ correct: false, reason: "tries" });
      else setTriesLeft(left);
    }
  };

  if (!round) return null;
  const seriesInfo = SERIES[round.answer.series];
  const isLast = index + 1 >= rounds.length;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      {/* HUD */}
      <div className="glass cut flex flex-wrap items-center justify-between gap-4 px-5 py-3">
        <div>
          <p className="text-xs text-mist">{diff.label}</p>
          <p className="display text-3xl">
            Player {index + 1}
            <span className="text-chalk/40"> / {rounds.length}</span>
          </p>
        </div>

        <ol className="order-last flex w-full gap-1.5 sm:order-none sm:w-auto" aria-label="Results so far">
          {rounds.map((r, i) => {
            const h = history[i];
            const state = h ? (h.correct ? "bg-win" : "bg-miss") : i === index ? "bg-ember" : "bg-chalk/15";
            return (
              <li
                key={r.answer.id}
                className={`h-2 flex-1 -skew-x-12 sm:w-6 sm:flex-none ${state}`}
                aria-label={h ? `Player ${i + 1}: ${h.correct ? "correct" : "missed"}` : `Player ${i + 1}`}
              />
            );
          })}
        </ol>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-xs text-mist">Streak</p>
            <p className={`display text-3xl ${streak > 0 ? "text-ember" : "text-chalk/40"}`}>×{streak}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-mist">Score</p>
            <SlotNumber value={score} minDigits={4} className="display text-4xl" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr]">
        {/* Clock column */}
        <div className="flex items-center justify-center gap-5 lg:flex-col lg:justify-start">
          <TimerRing secondsLeft={phase === "revealed" && outcome ? outcome.left : secondsLeft} total={diff.seconds} />
          <div className="kanji-stroke hidden text-7xl text-chalk/15 lg:block" aria-hidden="true">
            {seriesInfo.kanji}
          </div>
          {phase === "playing" && (
            <button
              type="button"
              onClick={() => setManualClues(Math.min(4, cluesShown + 1))}
              disabled={cluesShown >= 4}
              className="btn btn-ghost text-lg disabled:opacity-40"
            >
              {cluesShown >= 4 ? "All clues shown" : "Show next clue"}
            </button>
          )}
        </div>

        {/* Clue card */}
        <div>
          <div className="relative">
            <Brush
              key={round.answer.id}
              seed={index + 20}
              color={round.answer.series === "bluelock" ? "var(--color-rally)" : "var(--color-ember)"}
              className="absolute -left-3 -top-9 h-16 w-[55%] rotate-[-3deg] opacity-90"
            />
            <div className="glass cut relative p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-chalk/10 px-3 py-1 text-xs font-medium">{seriesInfo.label}</span>
                <span className="text-xs text-mist">
                  Clue {cluesShown} of 4
                  {phase === "playing" && cluesShown < 4 && ` (next in ${Math.max(0, Math.ceil(cluesShown * diff.clueEvery - elapsed))}s)`}
                </span>
              </div>

              <ul className="space-y-4">
                {round.answer.clues.map((clue, i) => (
                  <AnimatePresence key={`${round.answer.id}-${i}`}>
                    {i < cluesShown && (
                      <motion.li
                        initial={reduce ? false : { opacity: 0, x: -24, filter: "blur(4px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.4 }}
                        className="flex gap-4 text-base leading-relaxed sm:text-lg"
                      >
                        <span className="display mt-0.5 w-5 shrink-0 text-2xl text-ember">{i + 1}</span>
                        <span className="text-chalk/90">{clue}</span>
                      </motion.li>
                    )}
                  </AnimatePresence>
                ))}
              </ul>
            </div>
          </div>

          {/* Answer area */}
          <div className="mt-8" aria-live="polite">
            {phase === "playing" && diff.answer === "choice" && (
              <div className={`grid gap-2 ${round.options.length > 4 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                {round.options.map((o, i) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => finishRound({ correct: o.id === round.answer.id, reason: "pick", picked: o.id })}
                    className="group flex items-center gap-3 bg-chalk/[0.06] px-4 py-4 text-left transition-colors hover:bg-rally hover:text-chalk [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]"
                  >
                    <span className="display flex h-8 w-8 shrink-0 items-center justify-center bg-chalk/10 text-xl group-hover:bg-chalk/20">
                      {i + 1}
                    </span>
                    <span className="font-medium">{o.name}</span>
                  </button>
                ))}
              </div>
            )}

            {phase === "playing" && diff.answer === "type" && (
              <form onSubmit={submitGuess} className="space-y-3">
                <label htmlFor="guess" className="block text-sm text-mist">
                  Type the character's name. First name, last name or nickname all count.
                </label>
                <div key={shakeKey} className={`flex gap-2 ${shakeKey ? "shake" : ""}`}>
                  <input
                    ref={inputRef}
                    id="guess"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="e.g. Kageyama"
                    className="min-w-0 flex-1 border-b-2 border-chalk/20 bg-chalk/[0.06] px-4 py-3 text-lg outline-none placeholder:text-chalk/30 focus:border-ember"
                  />
                  <button type="submit" className="btn btn-ember">
                    Guess
                  </button>
                </div>
                <p className="text-sm text-mist">
                  {triesLeft} {triesLeft === 1 ? "try" : "tries"} left
                  {wrongGuesses.length > 0 && (
                    <span className="text-miss">. Not {wrongGuesses.map((w) => `“${w}”`).join(", ")}</span>
                  )}
                </p>
              </form>
            )}

            <AnimatePresence>
              {phase === "revealed" && outcome && (
                <motion.div
                  initial={reduce ? false : { y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="relative overflow-hidden"
                >
                  {diff.answer === "choice" && (
                    <div className={`mb-6 grid gap-2 ${round.options.length > 4 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                      {round.options.map((o) => {
                        const isAnswer = o.id === round.answer.id;
                        const isPicked = o.id === outcome.picked;
                        return (
                          <div
                            key={o.id}
                            className={`px-4 py-3 text-sm font-medium [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)] ${
                              isAnswer
                                ? "bg-win text-ink"
                                : isPicked
                                  ? "bg-miss text-ink"
                                  : "bg-chalk/[0.04] text-chalk/40"
                            }`}
                          >
                            {o.name}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="glass cut flex flex-wrap items-end justify-between gap-6 p-6 sm:p-8">
                    <div className="relative flex items-end gap-5">
                      <CharacterPortrait
                        key={round.answer.id}
                        id={round.answer.id}
                        name={round.answer.name}
                        size="lg"
                        ring={outcome.correct ? "win" : "miss"}
                      />
                      <div>
                        <p className={`text-sm font-medium ${outcome.correct ? "text-win" : "text-miss"}`}>
                          {outcome.correct
                            ? `Correct on clue ${outcome.clues}, +${outcome.points.toLocaleString("en-US")} points`
                            : outcome.reason === "time"
                              ? "Time's up. It was"
                              : outcome.reason === "tries"
                                ? "Out of tries. It was"
                                : "Not quite. It was"}
                        </p>
                        <p className="display mt-2 text-[clamp(2.8rem,7vw,4.8rem)]">{round.answer.name}</p>
                        <p className="mt-1 text-sm text-mist">
                          {round.answer.role}, {seriesInfo.label}
                        </p>
                      </div>
                    </div>
                    <button ref={nextBtnRef} type="button" onClick={goNext} className="btn btn-ember text-2xl">
                      {isLast ? "See results" : "Next player"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10 text-right">
            <button type="button" onClick={onQuit} className="text-sm text-mist underline-offset-4 hover:text-chalk hover:underline">
              Quit this game
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
