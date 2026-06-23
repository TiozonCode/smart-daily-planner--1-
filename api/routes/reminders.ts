import { Router } from "express";
import crypto from "crypto";
import { readDB, writeDB } from "../lib/db";

const router = Router();

router.get("/reminders", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authorized" });

  const db = readDB();
  const rems = db.reminders.filter((r) => r.userId === token);
  res.json(rems);
});

router.post("/reminders", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { title, time, repeat, category } = req.body;
  if (!title || !time) return res.status(400).json({ error: "Title and time required" });

  const db = readDB();
  const newRem = {
    id: crypto.randomUUID(),
    userId: token,
    title,
    time,
    repeat: repeat || "none",
    active: true,
    category: category || "Health",
  };

  db.reminders.push(newRem);
  writeDB(db);
  res.json(newRem);
});

router.post("/reminders/:id/toggle", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Access Denied" });

  const db = readDB();
  const index = db.reminders.findIndex((r) => r.id === id && r.userId === token);
  if (index === -1) return res.status(404).json({ error: "Reminder missing" });

  db.reminders[index].active = !db.reminders[index].active;
  writeDB(db);
  res.json(db.reminders[index]);
});

router.delete("/reminders/:id", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  db.reminders = db.reminders.filter((r) => !(r.id === id && r.userId === token));
  writeDB(db);
  res.json({ success: true });
});

router.get("/notifications", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const logs = db.reminderLogs
    .filter((l) => l.userId === token)
    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
  res.json(logs);
});

router.post("/reminders/:id/trigger", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const reminder = db.reminders.find((r) => r.id === id && r.userId === token);
  if (!reminder) return res.status(404).json({ error: "Reminder not found" });

  const log = {
    id: crypto.randomUUID(),
    userId: token,
    reminderId: reminder.id,
    title: reminder.title,
    time: reminder.time,
    triggeredAt: new Date().toISOString(),
  };

  db.reminderLogs.push(log);
  reminder.lastTriggered = log.triggeredAt;
  writeDB(db);

  res.json({ success: true, log });
});

export default router;
