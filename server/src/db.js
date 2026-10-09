import { MongoClient } from "mongodb";

let client;
let db;

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");

  client = new MongoClient(uri);
  await client.connect();
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
