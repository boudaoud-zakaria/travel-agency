import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { initializeDatabase } from "./db";
import routes from "./routes/index";
import { errorHandler } from "./middleware/error";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5001",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files (ID card images, logos)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", routes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

async function main() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`\n🚀 Travel Genius API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API:    http://localhost:${PORT}/api\n`);
  });
}

main().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
