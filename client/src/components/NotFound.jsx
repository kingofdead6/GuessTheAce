import { motion, useReducedMotion } from "motion/react";
import { Brush, Football, Volleyball } from "./Decor.jsx";

export default function NotFound({ path }) {
  const reduce = useReducedMotion();

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center px-4 pb-24 pt-32 sm:px-6">
      <div className="relative">
        <motion.p
          initial={reduce ? false : { y: -60, opacity: 0, rotate: -4 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 14 }}
          className="display relative text-[clamp(7rem,28vw,16rem)] leading-none text-ember"
          aria-hidden="true"
        >
          404
          <Brush seed={17} color="var(--color-rally)" className="absolute -bottom-2 left-0 -z-10 h-16 w-3/4 opacity-80" />
        </motion.p>
        <motion.div
          initial={reduce ? false : { x: 80, opacity: 0, rotate: 90 }}
          animate={{ x: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 90, damping: 12 }}
          className="absolute right-0 top-4 hidden gap-4 sm:flex"
          aria-hidden="true"
        >
          <Football className="h-20 w-20 opacity-80" />
          <Volleyball className="h-20 w-20 opacity-80" />
        </motion.div>
      </div>

      <h1 className="display mt-8 text-[clamp(2.6rem,7vw,4.5rem)]">Out of bounds</h1>
      <p className="mt-2 max-w-xl text-chalk/70">
        There's no page at <code className="break-all rounded bg-chalk/10 px-1.5 py-0.5 text-chalk">#/{path}</code>.
        The link may be old or mistyped.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#/play" className="btn btn-ember">
          Play a game
        </a>
        <a href="#/" className="btn btn-ghost">
          Back to home
        </a>
      </div>
    </main>
  );
}
