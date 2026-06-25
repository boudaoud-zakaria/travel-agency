import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { initializeDatabase } from "./db";
import routes from "./routes/index";
import { errorHandler } from "./middleware/error";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const IS_PROD = process.env.NODE_ENV === "production";

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In production the server itself serves the frontend, so no CORS needed.
if (!IS_PROD) {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5001",
      credentials: true,
    })
  );
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files (ID card images, logos)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", routes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Serve React SPA in production ────────────────────────────────────────────
if (IS_PROD) {
  // The static dir can be overridden via env (useful in Docker where the
  // frontend dist is copied to a known path).
  const staticDir = process.env.STATIC_DIR || path.join(process.cwd(), "public");

  if (fs.existsSync(staticDir)) {
    app.use(express.static(staticDir));

    // Catch-all: send index.html for any non-API route (SPA client-side routing)
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
  } else {
    console.warn(`[warn] STATIC_DIR "${staticDir}" not found — skipping static serving`);
  }
}

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

async function main() {
  await initializeDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Travel Genius API running on http://0.0.0.0:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API:    http://localhost:${PORT}/api`);
    if (IS_PROD) console.log(`   Static: serving React app from "public/"\n`);
  });
}

main().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
