import { CHARACTERS } from "../data/characters.js";

export const ROUNDS_PER_GAME = 10;

// Each difficulty changes the clock, how fast clues appear and how you answer.
export const DIFFICULTIES = {
  rookie: {
    id: "rookie",
    label: "Rookie",
    kanji: "新人",
    seconds: 30,
    clueEvery: 7,
    answer: "choice",
    options: 4,
    maxFame: 2,
    base: 100,
    blurb: "30 seconds per player. Pick from 4 names. Main cast only.",
  },
  starter: {
    id: "starter",
    label: "Starter",
    kanji: "先発",
    seconds: 20,
    clueEvery: 5,
    answer: "choice",
    options: 6,
    maxFame: 3,
    base: 150,
    blurb: "20 seconds per player. Pick from 6 names. Everyone is in.",
  },
  ace: {
    id: "ace",
    label: "Ace",
    kanji: "エース",
    seconds: 15,
    clueEvery: 4,
    answer: "type",
    attempts: 3,
    maxFame: 3,
    base: 250,
    blurb: "15 seconds per player. Type the name yourself. 3 tries.",
  },
};

export const SERIES_FILTERS = [
  { id: "both", label: "Both series" },
  { id: "bluelock", label: "Blue Lock" },
  { id: "haikyuu", label: "Haikyuu!!" },
];

const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function poolFor(seriesId, difficultyId) {
  const diff = DIFFICULTIES[difficultyId];
  return CHARACTERS.filter(
    (c) => (seriesId === "both" || c.series === seriesId) && c.fame <= diff.maxFame,
  );
}

// Builds the list of rounds for one game. Wrong options always come from
// the same series as the answer, so the series alone never gives it away.
export function buildRounds(seriesId, difficultyId) {
  const diff = DIFFICULTIES[difficultyId];
  const pool = shuffle(poolFor(seriesId, difficultyId));
  const picks = pool.slice(0, Math.min(ROUNDS_PER_GAME, pool.length));

  return picks.map((answer) => {
    let options = null;
    if (diff.answer === "choice") {
      const sameSeries = CHARACTERS.filter(
        (c) => c.series === answer.series && c.id !== answer.id && c.fame <= diff.maxFame,
      );
      options = shuffle([answer, ...shuffle(sameSeries).slice(0, diff.options - 1)]);
    }
    return { answer, options };
  });
}

// ── Scoring ─────────────────────────────────────────────
// Points = (base + time left × 10) × clue multiplier × streak bonus.
// Fewer clues seen means a bigger multiplier.
const CLUE_MULTIPLIER = [2, 2, 1.5, 1.2, 1];

export function scoreRound({ difficultyId, secondsLeft, cluesSeen, streak }) {
  const diff = DIFFICULTIES[difficultyId];
  const clueMult = CLUE_MULTIPLIER[Math.min(cluesSeen, 4)];
  const streakBonus = 1 + Math.min(streak, 5) * 0.1; // +10% per streak, max +50%
  return Math.round((diff.base + secondsLeft * 10) * clueMult * streakBonus);
}

// ── Typed answers (Ace mode) ────────────────────────────
const normalize = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function distance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

// Surnames shared by two characters (the Itoshi brothers, the Miya twins)
// are not accepted on their own.
const tokenCount = {};
for (const c of CHARACTERS) {
  for (const t of normalize(c.name).split(" ")) tokenCount[t] = (tokenCount[t] || 0) + 1;
}

function acceptedAnswers(character) {
  const full = normalize(character.name);
  const parts = full.split(" ");
  const accepted = new Set([full, [...parts].reverse().join(" ")]);
  for (const p of parts) if (p.length >= 2 && tokenCount[p] === 1) accepted.add(p);
  for (const a of character.aliases) accepted.add(normalize(a));
  return [...accepted];
}

export function isCorrectGuess(guess, character) {
  const g = normalize(guess);
  if (g.length < 2) return false;
  return acceptedAnswers(character).some((a) => {
    if (a === g) return true;
    const allowed = a.length <= 4 ? 0 : a.length <= 7 ? 1 : 2;
    return distance(a, g) <= allowed;
  });
}
