// Mirrors client/src/lib/game.js, used to reject impossible scores.
export const DIFFICULTIES = {
  rookie: { base: 100, seconds: 30 },
  starter: { base: 150, seconds: 20 },
  ace: { base: 250, seconds: 15 },
};

export const SERIES = ["both", "bluelock", "haikyuu"];
export const ROUNDS_PER_GAME = 10;

// Best possible round: answered instantly on clue 1 with a max streak bonus.
export function maxScore(difficulty, total) {
  const d = DIFFICULTIES[difficulty];
  return Math.round((d.base + d.seconds * 10) * 2 * 1.5) * total;
}
