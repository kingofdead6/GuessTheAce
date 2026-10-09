import express from "express";
import cors from "cors";
import { connect, close } from "./src/db.js";
import scoresRouter from "./src/scores.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);
app.use(express.json({ limit: "10kb" }));

const origins = (process.env.CLIENT_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
if (origins.length) app.use(cors({ origin: origins.includes("*") ? "*" : origins }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/scores", scoresRouter);

app.use((req, res) => res.status(404).json({ error: "Not found." }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error." });
});

try {
  await connect();
} catch (err) {
  console.error(`Could not connect to MongoDB: ${err.message}`);
  process.exit(1);
}
const server = app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => close().then(() => process.exit(0))));
}
