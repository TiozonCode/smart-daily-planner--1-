import { Router } from "express";
import crypto from "crypto";
import { readDB, writeDB } from "../lib/db";

const router = Router();

router.get("/goals", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Token required" });

  const db = readDB();
  const userGoals = db.goals.filter((g) => g.userId === token);
  res.json(userGoals);
});

router.post("/goals", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { title, target, current, unit, category } = req.body;
  if (!title || !target) return res.status(400).json({ error: "Goal details incomplete" });

  const db = readDB();
  const newGoal = {
    id: crypto.randomUUID(),
    userId: token,
    title,
    date: new Date().toISOString().split("T")[0],
    target: Number(target),
    current: Number(current) || 0,
    unit: unit || "units",
    category: category || "Health",
    completed: (Number(current) || 0) >= Number(target),
  };

  db.goals.push(newGoal);
  writeDB(db);
  res.json(newGoal);
});

router.post("/goals/:id/increment", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  const { amount } = req.body;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const index = db.goals.findIndex((g) => g.id === id && g.userId === token);
  if (index === -1) return res.status(404).json({ error: "Goal missing" });

  const step = Number(amount) || 1;
  const goal = db.goals[index];
  goal.current = Math.min(goal.target, goal.current + step);
  goal.completed = goal.current >= goal.target;

  writeDB(db);
  res.json(goal);
});

router.delete("/goals/:id", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  db.goals = db.goals.filter((g) => !(g.id === id && g.userId === token));
  writeDB(db);
  res.json({ success: true });
});

export default router;
