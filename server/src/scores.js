import { Router } from "express";
import { ObjectId } from "mongodb";
import { scores } from "./db.js";
import { DIFFICULTIES, SERIES, ROUNDS_PER_GAME, maxScore } from "./rules.js";

const router = Router();

const isInt = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

const toJSON = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  score: doc.score,
  correct: doc.correct,
  total: doc.total,
  bestStreak: doc.bestStreak,
  difficulty: doc.difficulty,
  series: doc.series,
  date: doc.date.toISOString(),
});

function validate(body) {
  const b = body ?? {};
  const name = typeof b.name === "string" ? b.name.trim().replace(/\s+/g, " ") : "";
  if (name.length < 2 || name.length > 20) return "Name must be 2 to 20 characters.";
  if (!DIFFICULTIES[b.difficulty]) return "Unknown difficulty.";
  if (!SERIES.includes(b.series)) return "Unknown series.";
  if (!isInt(b.total, 1, ROUNDS_PER_GAME)) return "Invalid round count.";
  if (!isInt(b.correct, 0, b.total)) return "Invalid correct count.";
  if (!isInt(b.bestStreak, 0, b.correct)) return "Invalid streak.";
  if (!isInt(b.score, 0, maxScore(b.difficulty, b.correct))) return "Invalid score.";
  return null;
}

// Very small per-IP limiter for submissions: 10 per minute.
const hits = new Map();
function limitSubmissions(req, res, next) {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 10) return res.status(429).json({ error: "Too many submissions, try again in a minute." });
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

// GET /api/scores?difficulty=ace&series=all&limit=20
router.get("/", async (req, res, next) => {
  try {
    const { difficulty, series = "all" } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const filter = {};
    if (difficulty) {
      if (!DIFFICULTIES[difficulty]) return res.status(400).json({ error: "Unknown difficulty." });
      filter.difficulty = difficulty;
    }
    if (series !== "all") {
      if (!SERIES.includes(series)) return res.status(400).json({ error: "Unknown series." });
      filter.series = series;
    }
    const docs = await scores().find(filter).sort({ score: -1, date: 1 }).limit(limit).toArray();
    res.json(docs.map(toJSON));
  } catch (err) {
    next(err);
  }
});

// POST /api/scores  -> { record, rank }
router.post("/", limitSubmissions, async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });

    const b = req.body;
    const doc = {
      name: b.name.trim().replace(/\s+/g, " "),
      score: b.score,
      correct: b.correct,
      total: b.total,
      bestStreak: b.bestStreak,
      difficulty: b.difficulty,
      series: b.series,
      date: new Date(),
    };
    const { insertedId } = await scores().insertOne(doc);
    doc._id = insertedId;

    // Rank within the level, same tie-break as the list (earlier score wins).
    const ahead = await scores().countDocuments({
      difficulty: doc.difficulty,
      $or: [{ score: { $gt: doc.score } }, { score: doc.score, date: { $lt: doc.date } }],
    });
    res.status(201).json({ record: toJSON(doc), rank: ahead + 1 });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/scores           -> wipe everything
// DELETE /api/scores/:id       -> remove one entry
// Both need the x-admin-key header.
function requireAdmin(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key || req.get("x-admin-key") !== key) return res.status(401).json({ error: "Not allowed." });
  next();
}

router.delete("/", requireAdmin, async (req, res, next) => {
  try {
    const { deletedCount } = await scores().deleteMany({});
    res.json({ deleted: deletedCount });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Bad id." });
    const { deletedCount } = await scores().deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ deleted: deletedCount });
  } catch (err) {
    next(err);
  }
});

export default router;
