# Guess the Ace API

Stores the shared leaderboard in MongoDB.

```bash
cp .env.example .env      # then paste your MONGODB_URI
npm install
npm run dev               # http://localhost:3001
```

Run the client (`npm run dev` in `/client`) at the same time; Vite forwards `/api` to this server.
When the client is deployed separately, build it with `VITE_API_URL=https://your-api.example.com`
and add the client's address to `CLIENT_ORIGIN`.

## Endpoints

| Method | Path | |
| --- | --- | --- |
| GET | `/api/scores?difficulty=ace&series=all&limit=20` | Top scores (difficulty optional; series `all`, `both`, `bluelock`, `haikyuu`) |
| POST | `/api/scores` | Save `{ name, score, correct, total, bestStreak, difficulty, series }` → `{ record, rank }` |
| DELETE | `/api/scores` | Wipe the board (header `x-admin-key: $ADMIN_KEY`) |
| DELETE | `/api/scores/:id` | Remove one entry (same header) |

Submissions are checked against the game rules (a score above the maximum possible for that level is rejected) and limited to 10 per minute per IP.

## Character images

```bash
npm run fetch-images
```

Looks up each character on MyAnimeList through the Jikan API and writes the portrait URLs to
`client/src/data/characterImages.js`. You can also set `image: "/characters/isagi.webp"` on any
character in `characters.js` (file in `client/public/characters/`) to override it.
