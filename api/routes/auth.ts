import { Router } from "express";
import crypto from "crypto";
import { readDB, writeDB, hashPassword, seedUserData } from "../lib/db";

const router = Router();

router.post("/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required register credentials" });
  }

  const db = readDB();
  const exists = Object.values(db.users).some(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (exists) {
    return res.status(400).json({ error: "An account with this email address already exists" });
  }

  const userId = crypto.randomUUID();
  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    name,
    passwordHash: hashPassword(password),
    joinedAt: new Date().toISOString(),
    productivityScore: 50,
  };

  db.users[userId] = newUser;
  seedUserData(userId, email, db);
  writeDB(db);

  const { passwordHash, ...userResponse } = newUser;
  res.json({ success: true, user: userResponse, token: userId });
});

router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Required fields empty" });
  }

  const db = readDB();
  const userMatch = Object.values(db.users).find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hashPassword(password)
  );

  if (!userMatch) {
    return res.status(401).json({ error: "Invalid email credentials or password match" });
  }

  const { passwordHash, ...userResponse } = userMatch;
  res.json({ success: true, user: userResponse, token: userMatch.id });
});

router.post("/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email target empty" });
  }
  res.json({ success: true, message: `An email recovery guideline has been processed for ${email}` });
});

export default router;
