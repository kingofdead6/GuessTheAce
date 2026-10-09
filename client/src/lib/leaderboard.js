// The leaderboard lives on the server (see /server), stored in MongoDB, so
// every player shares one board. In dev, Vite proxies /api to the server;
// in production set VITE_API_URL to the server's address.

const API = "https://guesstheace.onrender.com/api/scores";

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error("Can't reach the leaderboard server.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "The leaderboard server returned an error.");
  return body;
}

export function topScores({ difficulty, series = "all", limit = 10, signal } = {}) {
  const params = new URLSearchParams({ series, limit: String(limit) });
  if (difficulty) params.set("difficulty", difficulty);
  return request(`${API}?${params}`, { signal });
}

// Resolves to { record, rank } where rank is the position within the level.
export function saveScore(entry) {
  return request(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
}
