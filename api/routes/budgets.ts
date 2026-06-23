import { Router } from "express";
import crypto from "crypto";
import { readDB, writeDB } from "../lib/db";

const router = Router();

router.get("/budgets", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing authorization token" });

  const db = readDB();
  if (!db.budgets) db.budgets = [];
  const userBudgets = db.budgets.filter((b) => b.userId === token);
  res.json(userBudgets);
});

router.post("/budgets", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const { title, amount, type, notes, date } = req.body;
  if (!title) return res.status(400).json({ error: "Budget description must be provided" });
  if (amount === undefined || isNaN(parseFloat(amount))) return res.status(400).json({ error: "Budget amount must be a number" });

  const db = readDB();
  if (!db.budgets) db.budgets = [];

  const newBudget = {
    id: crypto.randomUUID(),
    userId: token,
    title,
    amount: parseFloat(amount),
    type: type || "allowance",
    notes: notes || "",
    date: date || new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  };

  db.budgets.push(newBudget);
  writeDB(db);

  res.json(newBudget);
});

router.delete("/budgets/:id", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const { id } = req.params;
  const db = readDB();
  if (!db.budgets) db.budgets = [];

  const initialLength = db.budgets.length;
  db.budgets = db.budgets.filter((b) => !(b.id === id && b.userId === token));

  if (db.budgets.length === initialLength) {
    return res.status(404).json({ error: "Budget item not found" });
  }

  writeDB(db);
  res.json({ success: true, message: "Budget item removed successfully" });
});

export default router;
