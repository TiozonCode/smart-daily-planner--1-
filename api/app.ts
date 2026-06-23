import express from "express";
import { ensureDB } from "./lib/db";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import habitRoutes from "./routes/habits";
import goalRoutes from "./routes/goals";
import reminderRoutes from "./routes/reminders";
import exerciseRoutes from "./routes/exercises";
import journalRoutes from "./routes/journals";
import budgetRoutes from "./routes/budgets";
import analyticsRoutes from "./routes/analytics";
import miscRoutes from "./routes/misc";

const app = express();
app.use(express.json());

// Initialize DB on first load (non-blocking)
ensureDB().catch((err) => console.error("Background DB init error:", err));

// Mount all route groups
app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", habitRoutes);
app.use("/api", goalRoutes);
app.use("/api", reminderRoutes);
app.use("/api", exerciseRoutes);
app.use("/api", journalRoutes);
app.use("/api", budgetRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", miscRoutes);

export default app;
