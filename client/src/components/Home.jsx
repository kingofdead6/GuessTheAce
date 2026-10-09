import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Brush, Football, Volleyball } from "./Decor.jsx";
import { DIFFICULTIES } from "../lib/game.js";
import { useScores } from "../lib/useScores.js";
import { CHARACTERS } from "../data/characters.js";

const DEMO = CHARACTERS.find((c) => c.id === "hinata");

function DemoCard() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? 4 : 1);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setShown((n) => (n >= 5 ? 1 : n + 1)), 2200);
    return () => clearInterval(t);
  }, [reduce]);

  const revealed = shown >= 5;

  return (
    <div className="relative">
      <Brush color="var(--color-rally)" seed={4} className="absolute -left-8 -top-6 h-24 w-[115%] rotate-[-4deg] opacity-70" />
      <div className="glass cut relative p-6 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <span className="rounded-full bg-chalk/10 px-3 py-1 text-xs font-medium text-chalk/80">Haikyuu!!</span>
          <span className="text-xs text-mist">Clue {Math.min(shown, 4)} of 4</span>
        </div>
        <ul className="space-y-3">
          {DEMO.clues.map((clue, i) => (
            <AnimatePresence key={i}>
              {i < shown && (
                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex gap-3 text-[0.95rem] leading-snug text-chalk/90"
                >
                  <span className="mt-[0.45em] h-2 w-2 shrink-0 rotate-45 bg-ember" />
                  {clue}
                </motion.li>
              )}
            </AnimatePresence>
          ))}
        </ul>
        <div className="mt-6 flex h-12 items-center border-t border-chalk/10 pt-4">
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.p
                key="answer"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="display text-4xl text-ember"
              >
                {DEMO.name}
              </motion.p>
            ) : (
              <motion.p key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="display text-4xl text-chalk/25">
                ? ? ?
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const reduce = useReducedMotion();
  const { status, rows: top } = useScores({ limit: 5 });

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid min-h-[92vh] max-w-6xl items-center gap-12 px-4 pb-16 pt-32 sm:px-6 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.h1
            initial={reduce ? false : { y: -120, opacity: 0, rotate: -4 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 13, delay: 0.1 }}
            className="display relative text-[clamp(4.2rem,13vw,9.5rem)]"
          >
            <span className="block">Who's</span>
            <span className="block">that ace?</span>
            <Brush seed={2} className="absolute -bottom-5 left-0 -z-10 h-14 w-[78%] opacity-90" />
          </motion.h1>

          <motion.p
            initial={reduce ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 max-w-md text-lg leading-relaxed text-chalk/80"
          >
            Read the clues and name the Blue Lock or Haikyuu!! character before the clock runs out.
            The fewer clues you need, the more you score.
          </motion.p>

          <motion.div
            initial={reduce ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a href="#/play" className="btn btn-ember">Start a game</a>
            <a href="#/leaderboard" className="btn btn-ghost">See the leaderboard</a>
          </motion.div>

          <div className="mt-10 flex items-center gap-4 text-sm text-mist">
            <Football className="spin-slow h-9 w-9" />
            <Volleyball className="spin-slow h-9 w-9 [animation-direction:reverse]" />
            <span>{CHARACTERS.length} characters from two series, 10 players a game</span>
          </div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <DemoCard />
        </motion.div>
      </section>

      {/* Difficulties */}
      <section id="levels" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="display text-[clamp(3rem,7vw,5.5rem)]">Pick your level</h2>
        <p className="mt-4 max-w-lg text-chalk/70">
          Every level gives you 10 players. Harder levels give you less time and a bigger base score.
        </p>

        <div className="mt-10 divide-y divide-chalk/10 border-y border-chalk/10">
          {Object.values(DIFFICULTIES).map((d) => (
            <a
              key={d.id}
              href={`#/play?level=${d.id}`}
              className="group grid grid-cols-[5.5rem_1fr] items-center gap-x-6 gap-y-1 py-6 transition-colors hover:bg-chalk/[0.03] sm:grid-cols-[7rem_1fr_auto] sm:px-4"
            >
              <span className="display row-span-2 text-[4rem] text-ember sm:row-span-1 sm:text-[5.5rem]">
                {d.seconds}
                <span className="ml-1 text-2xl text-chalk/40">s</span>
              </span>
              <span>
                <span className="display block text-4xl">{d.label}</span>
                <span className="mt-1 block text-sm text-chalk/70">{d.blurb}</span>
              </span>
              <span className="col-start-2 text-sm text-mist sm:col-start-auto sm:text-right">
                <span className="block font-serif text-2xl text-chalk/30">{d.kanji}</span>
                {d.base} pts base
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Scoring */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="display text-[clamp(3rem,7vw,5.5rem)]">How points work</h2>
          <dl className="grid gap-8 sm:grid-cols-3">
            <div>
              <dt className="display text-5xl text-ember">×2</dt>
              <dd className="mt-2 text-sm leading-relaxed text-chalk/75">
                Answer on the first clue to double your points. Two clues gives ×1.5, three gives ×1.2.
              </dd>
            </div>
            <div>
              <dt className="display text-5xl text-rally-soft">+10</dt>
              <dd className="mt-2 text-sm leading-relaxed text-chalk/75">
                Every second left on the clock adds 10 points before the multipliers.
              </dd>
            </div>
            <div>
              <dt className="display text-5xl text-chalk">+50%</dt>
              <dd className="mt-2 text-sm leading-relaxed text-chalk/75">
                Each correct answer in a row adds 10%, up to 50%. One miss resets the streak.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Leaderboard preview */}
      <section className="mx-auto max-w-6xl px-4 pb-28 pt-12 sm:px-6">
        <div className="glass cut p-6 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-[clamp(2.6rem,6vw,4.5rem)]">Top players</h2>
            <a href="#/leaderboard" className="text-sm font-medium text-ember hover:text-ember-soft">
              Full leaderboard
            </a>
          </div>
          {status === "loading" ? (
            <p className="mt-6 text-mist">Loading scores…</p>
          ) : status === "error" ? (
            <p className="mt-6 text-chalk/70">The leaderboard is offline right now.</p>
          ) : top.length === 0 ? (
            <p className="mt-6 text-chalk/70">
              No scores yet. <a href="#/play" className="text-ember underline underline-offset-4">Play a game</a> and take the first spot.
            </p>
          ) : (
            <ol className="mt-6 divide-y divide-chalk/10">
              {top.map((s, i) => (
                <li key={s.id} className="flex items-center gap-4 py-3">
                  <span className={`display w-8 text-3xl ${i === 0 ? "text-ember" : "text-chalk/40"}`}>{i + 1}</span>
                  <span className="flex-1 truncate font-medium">{s.name}</span>
                  <span className="hidden text-sm text-mist sm:block">{DIFFICULTIES[s.difficulty]?.label}</span>
                  <span className="display text-3xl tabular-nums">{s.score.toLocaleString("en-US")}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </main>
  );
}
