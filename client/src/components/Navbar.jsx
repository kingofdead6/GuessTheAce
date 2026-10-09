import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Football, Volleyball } from "./Decor.jsx";

const LINKS = [
  { href: "#/", label: "Home", route: "home" },
  { href: "#/play", label: "Play", route: "play" },
  { href: "#/leaderboard", label: "Leaderboard", route: "leaderboard" },
];

export default function Navbar({ route, inGame }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <motion.div
        className="absolute left-0 top-0 h-[3px] w-full origin-left bg-ember"
        style={{ scaleX: progress }}
      />
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300 sm:px-6 ${
          scrolled ? "mt-2 py-2" : "mt-4 py-3"
        }`}
      >
        <a
          href="#/"
          className={`glass flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 sm:pr-4 transition-all ${
            scrolled ? "scale-95" : ""
          }`}
        >
          <span className="relative flex h-8 w-12 shrink-0">
            <Football className="absolute left-0 h-8 w-8" />
            <Volleyball className="absolute left-4 h-8 w-8" />
          </span>
          <span className="display whitespace-nowrap text-[1.2rem] leading-none sm:text-[1.45rem]">Guess the Ace</span>
        </a>

        <ul className="glass flex items-center gap-1 rounded-full p-1 text-sm">
          {LINKS.map((l) => {
            const active = route === l.route || (l.route === "play" && inGame);
            return (
              <li key={l.route} className={l.route === "home" ? "hidden sm:block" : ""}>
                <a
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative block whitespace-nowrap rounded-full px-2.5 py-1.5 font-medium transition-colors sm:px-4 ${
                    active ? "text-chalk" : "text-mist hover:text-chalk"
                  }`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-ember"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
