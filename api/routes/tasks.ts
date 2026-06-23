import { Router } from "express";
import crypto from "crypto";
import { readDB, writeDB } from "../lib/db";
import { getAI } from "../lib/ai";

const router = Router();

router.get("/tasks", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing authorization token" });

  const db = readDB();
  const userTasks = db.tasks.filter((t) => t.userId === token);
  res.json(userTasks);
});

router.post("/tasks", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const { title, description, category, priority, dueDate, estimatedEffort, subSteps } = req.body;
  if (!title) return res.status(400).json({ error: "Task title must be provided" });

  const db = readDB();
  const newTask = {
    id: crypto.randomUUID(),
    userId: token,
    title,
    description: description || "",
    category: category || "Other",
    priority: priority || "medium",
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    estimatedEffort: Number(estimatedEffort) || 15,
    completed: false,
    subSteps: subSteps || [],
  };

  db.tasks.push(newTask);
  writeDB(db);
  res.json(newTask);
});

router.put("/tasks/:id", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Authorization error" });

  const db = readDB();
  const taskIndex = db.tasks.findIndex((t) => t.id === id && t.userId === token);
  if (taskIndex === -1) return res.status(404).json({ error: "Task item not found" });

  const currentTask = db.tasks[taskIndex];
  const { title, description, category, priority, dueDate, estimatedEffort, completed, subSteps } = req.body;

  db.tasks[taskIndex] = {
    ...currentTask,
    title: title !== undefined ? title : currentTask.title,
    description: description !== undefined ? description : currentTask.description,
    category: category !== undefined ? category : currentTask.category,
    priority: priority !== undefined ? priority : currentTask.priority,
    dueDate: dueDate !== undefined ? dueDate : currentTask.dueDate,
    estimatedEffort: estimatedEffort !== undefined ? Number(estimatedEffort) : currentTask.estimatedEffort,
    completed: completed !== undefined ? completed : currentTask.completed,
    completedAt: completed ? (currentTask.completedAt || new Date().toISOString()) : undefined,
    subSteps: subSteps !== undefined ? subSteps : currentTask.subSteps,
  };

  writeDB(db);
  res.json(db.tasks[taskIndex]);
});

router.post("/tasks/:id/toggle", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Unauthorized access" });

  const db = readDB();
  const taskIndex = db.tasks.findIndex((t) => t.id === id && t.userId === token);
  if (taskIndex === -1) return res.status(404).json({ error: "Task to toggle is missing" });

  const target = db.tasks[taskIndex];
  target.completed = !target.completed;
  if (target.completed) {
    target.completedAt = new Date().toISOString();
  } else {
    delete target.completedAt;
  }

  writeDB(db);
  res.json(target);
});

router.delete("/tasks/:id", (req, res) => {
  const token = req.headers.authorization;
  const { id } = req.params;
  if (!token) return res.status(401).json({ error: "Unauthorized action" });

  const db = readDB();
  const initialLen = db.tasks.length;
  db.tasks = db.tasks.filter((t) => !(t.id === id && t.userId === token));

  if (db.tasks.length === initialLen) {
    return res.status(404).json({ error: "Task could not be located" });
  }

  writeDB(db);
  res.json({ success: true });
});

router.post("/tasks/smart-sort", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Access Denied" });

  const db = readDB();
  const tasks = db.tasks.filter((t) => t.userId === token);
  const incompleteTasks = tasks.filter((t) => !t.completed);

  if (incompleteTasks.length === 0) {
    return res.json({ sortedIds: [], reasoning: "You have no outstanding incomplete tasks to sort!" });
  }

  const taskListText = incompleteTasks
    .map(
      (t) =>
        `- ID: ${t.id}\n  Title: ${t.title}\n  Description: ${t.description || ""}\n  Priority: ${t.priority}\n  Due Date: ${t.dueDate}\n  Estimated Effort: ${t.estimatedEffort} mins\n  Category: ${t.category || ""}`
    )
    .join("\n");

  const todayStr = new Date().toISOString().split("T")[0];

  const promptText = `
    You are an AI Smart Scheduling Assistant.
    Your task is to analyze the following list of active tasks and reorder them into a smart, highly efficient chronological order for the user to optimize their daily workload.
    Consider the following constraints and productivity guidelines:
    1. Deadlines / Due Dates: Tasks with upcoming deadlines (or overdue tasks compared to today: ${todayStr}) should generally be prioritized.
    2. Priority Labels (high, medium, low): High priority items are critical and should take precedence.
    3. Effort Estimates: Distribute higher effort tasks wisely and mix in quick/low-effort tasks to build positive completion momentum.
    4. Guard against fatigue: Avoid scheduling too many heavy/work tasks continuously if there are health/personal/easier options.

    Active Tasks List:
    ${taskListText}

    Please provide the optimal sorted list of task IDs.
    You MUST respond with a strict JSON format matching exactly:
    {
      "sortedIds": ["task-id-1", "task-id-2", ...],
      "reasoning": "A brief, friendly message explaining the productivity methodology and order of prioritization chosen (including why deadlines/priority/effort led to this layout)."
    }
  `;

  const ai = getAI();
  if (ai) {
    try {
      const response = await ai.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: "You are the advanced Smart task scheduler. Sort user's tasks to optimize productivity based on priority, urgency, and estimated duration. Return a highly logical JSON output with keys 'sortedIds' (array of task IDs) and 'reasoning' (string)." },
          { role: "user", content: promptText }
        ],
        response_format: { type: "json_object" },
      });

      const text = response.choices[0]?.message?.content;
      if (text) {
        const result = JSON.parse(text.trim());
        return res.json(result);
      }
    } catch (err) {
      console.error("Groq Smart Sort call failed. Falling back to rule-based scheduler:", err);
    }
  }

  const sortedIds = [...incompleteTasks]
    .sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      const diff = priorities[b.priority] - priorities[a.priority];
      if (diff !== 0) return diff;
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.estimatedEffort - b.estimatedEffort;
    })
    .map((t) => t.id);

  res.json({
    sortedIds,
    reasoning: "Sorted via Deterministic Scheduling Heuristic: prioritized critical high-priority items and near deadlines, while highlighting lower-effort items to establish a solid momentum loop."
  });
});

export default router;
