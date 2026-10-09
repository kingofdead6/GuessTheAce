import { motion, useReducedMotion } from "motion/react";

// Shows a number whose digits roll like a slot machine when they change.
export default function SlotNumber({ value, minDigits = 1, className = "", digitClassName = "" }) {
  const reduce = useReducedMotion();
  const text = String(Math.max(0, Math.floor(value))).padStart(minDigits, "0");

  return (
    <span className={`inline-flex tabular-nums ${className}`} aria-label={String(value)} role="text">
      {text.split("").map((d, i) => (
        <span
          key={text.length - i}
          className={`relative inline-block h-[1em] overflow-hidden ${digitClassName}`}
          style={{ width: "0.62em" }}
          aria-hidden="true"
        >
          <motion.span
            className="absolute left-0 top-0 flex flex-col"
            initial={false}
            animate={{ y: `${-Number(d)}em` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block h-[1em] text-center leading-[1em]">
                {n}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
