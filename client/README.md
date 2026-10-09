# Guess the Ace

A character-guessing game for Blue Lock and Haikyuu!! fans, in the SEC Welcome Day style
(dark background, orange and blue, Darker Grotesque + Poppins, brush strokes, kanji, parallax).

Built with React 19, Vite, Tailwind CSS v4 and Motion. Fonts are bundled, so it works offline.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Deploy `dist/` anywhere static. On Vercel, import the folder and keep the default Vite settings.

## How the game works

- 10 players per game. Choose Blue Lock, Haikyuu!! or both.
- Each player has 4 clues, from hardest to easiest. A new clue appears every few seconds,
  or press **Show next clue** to get it now.
- Levels:

| Level   | Time | Answer                    | New clue every | Base points |
|---------|------|---------------------------|----------------|-------------|
| Rookie  | 30 s | Pick from 4 names         | 7 s            | 100         |
| Starter | 20 s | Pick from 6 names         | 5 s            | 150         |
| Ace     | 15 s | Type the name (3 tries)   | 4 s            | 250         |

- Points = (base + 10 × seconds left) × clue multiplier × streak bonus.
  Clue multiplier: ×2 on clue 1, ×1.5 on clue 2, ×1.2 on clue 3, ×1 on clue 4.
  Streak bonus: +10% per correct answer in a row, up to +50%.
- Keyboard: press 1–6 to pick a name, Enter for the next player.
- In Ace mode, first name, last name or nickname all count, and small typos are accepted.
  Shared surnames (Itoshi, Miya) need the first name.

## Where to edit things

| What                         | File                          |
|------------------------------|-------------------------------|
| Characters and clues         | `src/data/characters.js`      |
| Levels, timing, scoring      | `src/lib/game.js`             |
| Leaderboard storage          | `src/lib/leaderboard.js`      |
| Colors and fonts             | `src/index.css` (`@theme`)    |

To add a character, copy any entry in `characters.js` and give it a unique `id`,
a `fame` (1 main cast, 2 well known, 3 deep cut; Rookie only uses 1–2) and four clues.

## Leaderboard

Scores are saved in the browser's localStorage, so each device has its own board.
For one shared board across everyone (for example at a club event), replace
`loadScores` and `saveScore` in `src/lib/leaderboard.js` with calls to a small API
or database (Supabase, Firebase, Vercel KV…). The rest of the app stays the same.

## Note

This is a fan-made quiz with text clues only. It includes no official artwork or logos.
