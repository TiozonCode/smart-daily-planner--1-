import { Router } from "express";
import crypto from "crypto";
import { readDB, writeDB } from "../lib/db";

const router = Router();

router.get("/habits", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing authorization token" });

  const db = readDB();
  const habits = db.habits.filter((h) => h.userId === token);
  res.json(habits);
});

router.post("/habits", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Access Denied" });

  const { name, category } = req.body;
  if (!name) return res.status(400).json({ error: "Habit name must be present" });

  const db = readDB();
  const newHabit = {
    id: crypto.randomUUID(),
    userId: token,
    name,
    category: category || "Health",
    streak: 0,
    history: [],
    lastCheckedIn: undefined,
    createdAt: new Date().toISOString(),
  };

  db.habits.push(newHabit);
  writeDB(db);
  res.json(newHabit);
});

router.post("/habits/:id/checkin", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Unauthorized access" });

  const db = readDB();
  const habitIndex = db.habits.findIndex((h) => h.id === id && h.userId === token);
  if (habitIndex === -1) return res.status(404).json({ error: "Habit list missing" });

  const habit = db.habits[habitIndex];
  const todayStr = new Date().toISOString().split("T")[0];

  const alreadyCheckedIn = habit.history.includes(todayStr);
  if (alreadyCheckedIn) {
    habit.history = habit.history.filter((d: string) => d !== todayStr);
    const sortedHistory = [...habit.history].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const matchStr = checkDate.toISOString().split("T")[0];
      if (sortedHistory.includes(matchStr)) {
        streak++;
      } else {
        if (i === 0) {
          const yesterdayObj = new Date();
          yesterdayObj.setDate(yesterdayObj.getDate() - 1);
          const yesterdayStr = yesterdayObj.toISOString().split("T")[0];
          if (sortedHistory.includes(yesterdayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    habit.streak = streak;
    if (habit.lastCheckedIn === todayStr) {
      habit.lastCheckedIn = sortedHistory[0] || undefined;
    }
  } else {
    habit.history.push(todayStr);
    habit.lastCheckedIn = todayStr;
    const sortedHistory = [...habit.history].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const matchStr = checkDate.toISOString().split("T")[0];
      if (sortedHistory.includes(matchStr)) {
        streak++;
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    habit.streak = streak;
  }

  writeDB(db);
  res.json(habit);
});

router.post("/habits/:id/toggle-archive", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Access Denied" });

  const db = readDB();
  const habitIndex = db.habits.findIndex((h) => h.id === id && h.userId === token);
  if (habitIndex === -1) return res.status(404).json({ error: "Habit not found" });

  const habit = db.habits[habitIndex];
  habit.isArchived = !habit.isArchived;

  writeDB(db);
  res.json(habit);
});

router.delete("/habits/:id", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Access Denied" });

  const db = readDB();
  const initCount = db.habits.length;
  db.habits = db.habits.filter((h) => !(h.id === id && h.userId === token));

  if (db.habits.length === initCount) return res.status(404).json({ error: "Habit not found" });

  writeDB(db);
  res.json({ success: true });
});

export default router;
