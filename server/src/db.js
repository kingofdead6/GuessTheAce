import { MongoClient } from "mongodb";

let client;
let db;

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");

  if (/<[^>]+>/.test(uri)) {
    throw new Error("MONGODB_URI still contains a placeholder like <db_username>. Put your real Atlas username and password in it.");
  }

  client = new MongoClient(uri);
  try {
    await client.connect();
  } catch (err) {
    if (err.code === 8000 || /auth/i.test(err.message)) {
      throw new Error(
        "MongoDB rejected the username/password in MONGODB_URI. Check the database user in Atlas " +
          "(Database Access), and URL-encode special characters in the password (@ → %40, : → %3A, / → %2F).",
      );
    }
    throw err;
  }
  db = client.db(process.env.MONGODB_DB || "guess-the-ace");

  // Matches the leaderboard query: filter by level/series, sort by score then date.
  await scores().createIndex({ difficulty: 1, series: 1, score: -1, date: 1 });
  await scores().createIndex({ score: -1, date: 1 });
  return db;
}

export const scores = () => db.collection("scores");

export async function close() {
  await client?.close();
}
