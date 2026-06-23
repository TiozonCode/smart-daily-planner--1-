import type { Request, Response } from "express";
import type { Express } from "express";
import app from "./app";

export default function handler(req: Request, res: Response) {
  if (!app) {
    return res.status(500).json({ error: "Server initialization failed" });
  }
  app(req, res);
}
