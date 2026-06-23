import { Router } from "express";
import { readDB } from "../lib/db";
import { getAI } from "../lib/ai";

const router = Router();

router.get("/discord-themes", (_req, res) => {
  const themes = [
    { id: "discord-dark", name: "Discord Dark (Classic)", description: "The classic, eye-friendly grey Discord dark theme.", bg: "#313338", cardBg: "#2b2d31", accent: "#5865f2", type: "dark" },
    { id: "discord-light", name: "Discord Light", description: "Sleek and bright, a high-contrast elegant theme.", bg: "#f2f3f5", cardBg: "#ffffff", accent: "#5865f2", type: "light" },
    { id: "discord-midnight", name: "Midnight (AMOLED)", description: "Pitch black backdrop for AMOLED screen devices.", bg: "#000000", cardBg: "#111214", accent: "#5865f2", type: "dark" },
    { id: "discord-forest", name: "Forest Green", description: "Calm cedar woods, sage bushes, and evergreen needles.", bg: "#131b19", cardBg: "#1a2421", accent: "#248046", type: "dark" },
    { id: "discord-sunset", name: "Sunset Sunrise", description: "Lovely tangerine sky with violet and deep dark clouds.", bg: "#1e171d", cardBg: "#251d24", accent: "#f47b67", type: "dark" },
    { id: "discord-sakura", name: "Sakura Pink", description: "Soft light-pink cherry blossoms and aesthetic night magenta.", bg: "#21161c", cardBg: "#2b1e25", accent: "#eb459e", type: "dark" },
    { id: "discord-sea", name: "Sea Cyan", description: "Deep ocean depths and electric bioluminescent reef vibes.", bg: "#111522", cardBg: "#161d2d", accent: "#00b0f4", type: "dark" },
    { id: "discord-crimson", name: "Crimson Red", description: "A stunning high-energy scarlet red with pitch dark velvet.", bg: "#1b1012", cardBg: "#231518", accent: "#ed4245", type: "dark" },
  ];
  res.json(themes);
});

router.get("/profile", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authorized" });

  const db = readDB();
  const user = db.users[token];
  if (!user) return res.status(404).json({ error: "Account not located" });

  const { passwordHash, ...userResponse } = user;
  res.json(userResponse);
});

router.post("/ai/prioritize", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Access Denied" });

  const db = readDB();
  const userName = db.users[token]?.name || "Planner User";
  const tasks = db.tasks.filter((t) => t.userId === token);
  const habits = db.habits.filter((h) => h.userId === token);
  const goals = db.goals.filter((g) => g.userId === token);

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const activeHabits = habits.map((h) => `${h.name} (${h.category})`);
  const activeGoals = goals.map((g) => `${g.title}: ${g.current}/${g.target} ${g.unit}`);

  const taskListText = incompleteTasks
    .map(
      (t) =>
        `- Title: ${t.title}\n  Description: ${t.description}\n  Priority: ${t.priority}\n  Due Date: ${t.dueDate}\n  Estimated Effort: ${t.estimatedEffort} mins\n  Category: ${t.category}`
    )
    .join("\n");

  const promptText = `
    Hello! Please analyze the daily schedule planning materials for user ${userName} and recommend a highly intelligent task prioritization priority.
    
    Current Date: ${new Date().toISOString().split("T")[0]}
    
    Active Incomplete Tasks for the planner:
    ${taskListText || "No active incomplete tasks found."}
    
    Active Habits in Streak progression:
    ${activeHabits.join(", ") || "No habits configured yet."}
    
    Goals Today:
    ${activeGoals.join(", ") || "No daily goals set."}
    
    Please prioritize these items into an optimal workday workflow. Ensure you recommend which tasks to start first, suggest daily timeblocks (starting from morning around 9:00 AM) that account for estimated efforts, include warnings for urgent deadlines or streak preservation support, and summarize the overall methodology clearly.
  `;

  const ai = getAI();
  if (ai) {
    try {
      const response = await ai.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: "You are the advanced Smart Daily Planner Prioritization Assistant. Your job is to organize the user's workload into a beautifully prioritized roadmap. Output must be perfectly valid JSON with keys: 'recommendedOrder' (array of task titles), 'explanation' (string), 'suggestedSchedule' (array of {time, taskTitle, reason}), 'warnings' (array of strings), and 'generatedAt' (ISO string)." },
          { role: "user", content: promptText }
        ],
        response_format: { type: "json_object" },
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error("Empty text returned from Groq API");
      }

      const result = JSON.parse(text.trim());
      result.generatedAt = new Date().toISOString();
      return res.json(result);
    } catch (err) {
      console.error("Groq invocation failed, rolling back to deterministic engine:", err);
    }
  }

  const recommendedOrder = incompleteTasks
    .sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      const diff = priorities[b.priority] - priorities[a.priority];
      if (diff !== 0) return diff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .map((t) => t.title);

  const explanation = "Processed by the Local Heuristic Prioritization Engine. Tasks are optimized by placing High-Priority items with upcoming deadlines first ('Eat the Frog' rule), followed by low-effort medium/low tasks to build strong momentum.";

  const suggestedSchedule: any[] = [];
  let currentHour = 9;
  let currentMinutes = 0;

  incompleteTasks.forEach((task) => {
    const formattedStart = `${String(currentHour).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;
    currentMinutes += task.estimatedEffort;
    while (currentMinutes >= 60) {
      currentHour += 1;
      currentMinutes -= 60;
    }
    const formattedEnd = `${String(currentHour).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;
    suggestedSchedule.push({
      time: `${formattedStart} - ${formattedEnd}`,
      taskTitle: task.title,
      reason: `Assigned based on estimated effort of ${task.estimatedEffort} mins and its ${task.priority} priority status.`,
    });

    const breakStart = `${String(currentHour).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;
    currentMinutes += 15;
    if (currentMinutes >= 60) {
      currentHour += 1;
      currentMinutes -= 60;
    }
    const breakEnd = `${String(currentHour).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;
    suggestedSchedule.push({
      time: `${breakStart} - ${breakEnd}`,
      taskTitle: "Hydration & Stretch Break",
      reason: "Optimal 15-minute cognitive cool-down to prevent mental exhaustion and track habits.",
    });
  });

  const warnings: string[] = [];
  const todayStr = new Date().toISOString().split("T")[0];
  incompleteTasks.forEach((t) => {
    if (t.dueDate < todayStr) {
      warnings.push(`⚠️ "${t.title}" is OVERDUE (Due: ${t.dueDate})`);
    }
  });
  habits.forEach((h) => {
    if (h.lastCheckedIn !== todayStr && h.streak > 3) {
      warnings.push(`🔥 Habit streak at risk: "${h.name}" is on a ${h.streak}-day streak! Check-in to protect it.`);
    }
  });

  if (warnings.length === 0) {
    warnings.push("💡 You have an optimal workload allocation today. Maintain active focus breaks.");
  }

  res.json({
    recommendedOrder,
    explanation,
    suggestedSchedule,
    warnings,
    generatedAt: new Date().toISOString(),
  });
});

export default router;
