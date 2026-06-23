import type { Request, Response } from "express";

// Lazy-init the Express app so cold-start errors get caught gracefully
let app: any;

try {
  app = (await import("../server")).default;
} catch (err: any) {
  console.error("Failed to load Express app:", err);
}

export default function handler(req: Request, res: Response) {
  if (!app) {
    return res.status(500).json({ error: "Server initialization failed" });
  }
  app(req, res);
}
