import { Router } from "express";
import crypto from "crypto";
import { readDB, writeDB } from "../lib/db";

const router = Router();

router.get("/journals", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing authorization token" });

  const db = readDB();
  if (!db.journals) db.journals = [];
  const userJournals = db.journals.filter((j) => j.userId === token);
  res.json(userJournals);
});

router.post("/journals", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const { title, content, mood, emoji, stickers, date, isLocked, passcode } = req.body;
  if (!title) return res.status(400).json({ error: "Journal title must be provided" });

  const db = readDB();
  if (!db.journals) db.journals = [];

  const newJournal = {
    id: crypto.randomUUID(),
    userId: token,
    title,
    content: content || "",
    mood: mood || "happy_cat",
    emoji: emoji || "😸",
    stickers: Array.isArray(stickers) ? stickers : [],
    date: date || new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    isLocked: !!isLocked,
    passcode: passcode || "",
  };

  db.journals.push(newJournal);
  writeDB(db);

  res.json(newJournal);
});

router.delete("/journals/:id", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const { id } = req.params;
  const db = readDB();
  if (!db.journals) db.journals = [];

  const initialLength = db.journals.length;
  db.journals = db.journals.filter((j) => !(j.id === id && j.userId === token));

  if (db.journals.length === initialLength) {
    return res.status(404).json({ error: "Journal entry not found" });
  }

  writeDB(db);
  res.json({ success: true, message: "Journal entry removed successfully" });
});

export default router;
