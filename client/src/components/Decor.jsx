import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

// ── Brush stroke ────────────────────────────────────────
// A rough paint stroke made from an SVG path with a turbulence filter.
export function Brush({ color = "var(--color-ember)", className = "", seed = 3, style }) {
  const id = `brush-${seed}`;
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 600 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id={id} x="-5%" y="-30%" width="110%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="3" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="22" />
        </filter>
      </defs>
      <path
        filter={`url(#${id})`}
        fill={color}
        d="M18 62 C 90 30, 210 22, 330 30 S 540 34, 588 46 C 592 62, 584 78, 560 84 C 430 98, 300 92, 180 96 S 40 100, 14 86 C 6 78, 8 68, 18 62 Z"
      />
    </svg>
  );
}

// ── Topographic lines ───────────────────────────────────
export function Topo({ className = "" }) {
  const rings = Array.from({ length: 11 }, (_, i) => i);
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true" fill="none">
      {rings.map((i) => {
        const r = 22 + i * 17;
        const wobble = 6 + i * 1.6;
        return (
          <path
            key={i}
            stroke="currentColor"
            strokeWidth="1"
            d={`M ${200 - r} 200
               C ${200 - r} ${200 - r * 0.7 - wobble}, ${200 + r * 0.5} ${200 - r - wobble}, ${200 + r} ${200 - r * 0.2}
               S ${200 + r * 0.6 + wobble} ${200 + r}, ${200 - r * 0.1} ${200 + r * 0.9}
               S ${200 - r - wobble} ${200 + r * 0.4}, ${200 - r} 200 Z`}
          />
        );
      })}
    </svg>
  );
}

// ── Balls ───────────────────────────────────────────────
export function Football({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#f3f5ff" stroke="#0a0d1c" strokeWidth="3" />
      <polygon points="50,30 66,42 60,61 40,61 34,42" fill="#0a0d1c" />
      <g stroke="#0a0d1c" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M50 30 L50 6" />
        <path d="M66 42 L89 34" />
        <path d="M60 61 L74 82" />
        <path d="M40 61 L26 82" />
        <path d="M34 42 L11 34" />
      </g>
      <path d="M50 6 L42 4 L58 4 Z M89 34 L95 44 L92 26 Z M11 34 L5 44 L8 26 Z" fill="#0a0d1c" />
      <path d="M74 82 L66 92 L84 88 Z M26 82 L34 92 L16 88 Z" fill="#0a0d1c" />
    </svg>
  );
}

export function Volleyball({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <clipPath id="vb-clip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      <g clipPath="url(#vb-clip)">
        <rect width="100" height="100" fill="#f3f5ff" />
        <path d="M50 50 C 40 34, 40 16, 52 0 L 100 0 L 100 30 C 84 44, 66 52, 50 50 Z" fill="#2f6bff" />
        <path d="M50 50 C 34 56, 16 54, 0 44 L 0 100 L 20 100 C 26 78, 38 60, 50 50 Z" fill="#ff6b1a" />
      </g>
      <g fill="none" stroke="#0a0d1c" strokeWidth="3" strokeLinecap="round">
        <path d="M50 50 C 40 34, 40 16, 52 4" />
        <path d="M50 50 C 66 52, 84 44, 95 32" />
        <path d="M50 50 C 34 56, 16 54, 5 46" />
        <path d="M50 50 C 38 60, 26 78, 22 92" />
        <path d="M50 50 C 58 66, 72 80, 88 84" />
        <circle cx="50" cy="50" r="46" />
      </g>
    </svg>
  );
}

// ── Sports icon pattern (football, volleyball, whistle, net) ──
export function IconPattern({ className = "" }) {
  return (
    <svg className={className} aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id="sports-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="22" cy="22" r="10" />
            <path d="M22 12 L22 32 M12 22 L32 22" />
            <circle cx="82" cy="78" r="10" />
            <path d="M74 72 C 80 78, 84 78, 90 72 M76 86 C 80 80, 86 80, 89 84" />
            <path d="M70 18 h14 a6 6 0 1 1 -6 8 h-8 z" />
            <path d="M14 82 h20 M14 88 h20 M14 94 h20 M18 78 v20 M24 78 v20 M30 78 v20" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sports-pattern)" />
    </svg>
  );
}

// ── Page background with mouse parallax ─────────────────
export function Background() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 });
  const sy = useSpring(my, { stiffness: 40, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  const far = { x: useTransform(sx, (v) => v * -18), y: useTransform(sy, (v) => v * -12) };
  const mid = { x: useTransform(sx, (v) => v * 36), y: useTransform(sy, (v) => v * 24) };
  const near = { x: useTransform(sx, (v) => v * -60), y: useTransform(sy, (v) => v * -40) };

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* glow */}
      <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-ember/20 blur-[120px]" />
      <div className="absolute -bottom-52 -right-40 h-[38rem] w-[38rem] rounded-full bg-rally/25 blur-[130px]" />

      <IconPattern className="absolute inset-0 text-chalk/[0.025]" />

      <motion.div style={far} className="absolute -right-24 top-10 w-[42rem] text-rally/25">
        <Topo className="w-full" />
      </motion.div>
      <motion.div style={far} className="absolute -left-40 bottom-[-8rem] w-[30rem] text-ember/15">
        <Topo className="w-full" />
      </motion.div>

      <motion.div
        style={mid}
        className="kanji-stroke absolute right-[3vw] top-[12vh] text-[clamp(6rem,15vw,13rem)] text-chalk/[0.11]"
      >
        当てろ
      </motion.div>
      <motion.div
        style={mid}
        className="kanji-stroke absolute left-[2vw] top-[45vh] hidden text-[clamp(5rem,11vw,10rem)] text-ember/[0.2] md:block"
      >
        推理
      </motion.div>

      <motion.div style={near} className="absolute -left-10 top-[22vh] w-[26rem] rotate-[-8deg] opacity-30">
        <Brush color="var(--color-rally)" seed={7} className="w-full" />
      </motion.div>
      <motion.div style={near} className="absolute -right-16 bottom-[14vh] w-[30rem] rotate-[6deg] opacity-25">
        <Brush color="var(--color-ember)" seed={11} className="w-full" />
      </motion.div>
    </div>
  );
}
