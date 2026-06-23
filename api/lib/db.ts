import crypto from "crypto";
import { readSQLiteDB, writeSQLiteDB, initSQLite } from "../../src/db/sqlite";

export interface DBStructure {
  users: Record<string, any>;
  tasks: any[];
  habits: any[];
  goals: any[];
  reminders: any[];
  reminderLogs: any[];
  exercises?: any[];
  journals?: any[];
  budgets?: any[];
}

export function readDB(): DBStructure {
  try {
    const db = readSQLiteDB();
    if (!db.exercises) db.exercises = [];
    if (!db.journals) db.journals = [];
    if (!db.budgets) db.budgets = [];
    return db;
  } catch (err) {
    console.error("Error reading database", err);
    return { users: {}, tasks: [], habits: [], goals: [], reminders: [], reminderLogs: [], exercises: [], journals: [], budgets: [] };
  }
}

export function writeDB(db: DBStructure) {
  try {
    writeSQLiteDB(db);
  } catch (err) {
    console.error("Error writing database", err);
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function seedUserData(userId: string, userEmail: string, db: DBStructure) {
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const sampleTasks = [
    {
      id: crypto.randomUUID(), userId,
      title: "Complete Q3 Project Proposal Document",
      description: "Write executive summary, gather timeline inputs, and draft budget allocations.",
      category: "Work", priority: "high", dueDate: todayStr, estimatedEffort: 45, completed: false,
    },
    {
      id: crypto.randomUUID(), userId,
      title: "Study Advanced Networking Concepts",
      description: "Read chapters on HTTP/3 and transport protocols to prepare for certifications.",
      category: "Education", priority: "high", dueDate: tomorrowStr, estimatedEffort: 60, completed: false,
    },
    {
      id: crypto.randomUUID(), userId,
      title: "Pick up fresh groceries & meal prep",
      description: "Visit the organic store. Purchase spinach, berries, avocados, salmon, and Greek yogurt.",
      category: "Personal", priority: "low", dueDate: todayStr, estimatedEffort: 30, completed: true,
      completedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), userId,
      title: "Weekly HIIT Cardio workout",
      description: "Perform 30 minutes of high-intensity intervals followed by static core stretching.",
      category: "Health", priority: "medium", dueDate: todayStr, estimatedEffort: 35, completed: false,
    },
    {
      id: crypto.randomUUID(), userId,
      title: "Organize office storage desk",
      description: "De-clutter obsolete papers, arrange charging cords, and clean hardware equipment.",
      category: "Personal", priority: "low", dueDate: tomorrowStr, estimatedEffort: 20, completed: false,
    },
  ];

  const sampleHabits = [
    {
      id: crypto.randomUUID(), userId, name: "Drink 3L of Water Daily", category: "Health",
      streak: 5, lastCheckedIn: yesterdayStr,
      history: [yesterdayStr, "2026-06-14", "2026-06-13", "2026-06-12", "2026-06-11"],
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), userId, name: "Read 15 Pages of a Book", category: "Education",
      streak: 9, lastCheckedIn: yesterdayStr,
      history: [yesterdayStr, "2026-06-14", "2026-06-13", "2026-06-12", "2026-06-11", "2026-06-10", "2026-06-09", "2026-06-08", "2026-06-07"],
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), userId, name: "Reflective Morning Journaling", category: "Personal",
      streak: 12, lastCheckedIn: todayStr,
      history: [todayStr, yesterdayStr, "2026-06-14", "2026-06-13", "2026-06-12", "2026-06-11", "2026-06-10", "2026-06-09", "2026-06-08", "2026-06-07", "2026-06-06", "2026-06-05"],
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleGoals = [
    {
      id: crypto.randomUUID(), userId, title: "Stay Hydrated", date: todayStr,
      target: 3000, current: 1800, unit: "ml", category: "Health", completed: false,
    },
    {
      id: crypto.randomUUID(), userId, title: "Step Count Progress", date: todayStr,
      target: 8000, current: 4500, unit: "steps", category: "Health", completed: false,
    },
    {
      id: crypto.randomUUID(), userId, title: "Focus Block Duration", date: todayStr,
      target: 120, current: 120, unit: "minutes", category: "Work", completed: true,
    },
  ];

  const sampleReminders = [
    {
      id: crypto.randomUUID(), userId, title: "Take a deep breathing rest break",
      time: "11:00", repeat: "daily", active: true, category: "Health",
    },
    {
      id: crypto.randomUUID(), userId, title: "Track & reflect today's victories",
      time: "21:30", repeat: "daily", active: true, category: "Personal",
    },
  ];

  const sampleExercises = [
    {
      id: crypto.randomUUID(), userId, name: "Strength Full-Body routine", category: "strength",
      duration: 45, calories: 320, intensity: "medium", weight: 45, reps: 10, sets: 3,
      distance: 0, notes: "Focused on compound lifting: Squats, Bench press, and Overhead press. Felt highly energetic.",
      movements: ["Jumping Jacks (Warmup)", "Barbell squats", "Incline chest press", "Overhead barbell press", "Plank hold"],
      date: yesterdayStr, completed: true, createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), userId, name: "Evening Cardio Jog", category: "cardio",
      duration: 30, calories: 280, intensity: "high", weight: 0, reps: 0, sets: 0,
      distance: 4.2, notes: "Steady jog along the lake path. Beat previous km pace record!",
      movements: ["Calf stretch", "High knees warmup", "4.2km Tempo Run", "Slow walking cooldown"],
      date: todayStr, completed: true, createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), userId, name: "Ashtanga Flow Yoga", category: "flexibility",
      duration: 25, calories: 110, intensity: "low", weight: 0, reps: 0, sets: 0,
      distance: 0, notes: "Stretching hamstring tension and working on breathing focus.",
      movements: ["Sun Salutation A", "Downward Dog pose", "Cobra spinal arch", "Deep Child's Pose rest"],
      date: tomorrowStr, completed: false, createdAt: new Date().toISOString(),
    },
  ];

  const sampleJournals = [
    {
      id: crypto.randomUUID(), userId, title: "My first day with Cat Planner! 🐾",
      content: "Today I set up my daily tasks. I had some yummy tuna flakes and played with a giant sparkly bubble! Everything feels so magical here and my cat friends are extremely cute. I am going to track my reading habit every single day! Purrfect!",
      mood: "happy_cat", emoji: "😸", stickers: ["🌟", "🐾", "🐟"],
      date: todayStr, createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), userId, title: "Feeling a bit sleepy after lunch 😴",
      content: "After playing for an hour, I took a long cozy nap in a warm sunny spot. Purring makes me feel very calm. Ready to complete my drawing challenge later tonight with colored crayons!",
      mood: "sleepy_cat", emoji: "😴", stickers: ["🐾", "🥛"],
      date: todayStr, createdAt: new Date().toISOString(),
    },
  ];

  const sampleBudgets = [
    {
      id: crypto.randomUUID(), userId, title: "Weekly Kitty Pocket Money Allowance 🪙",
      amount: 15.00, type: "allowance",
      notes: "Earned for reading a book, keeping my desk super neat, and feeding my pet cat!",
      date: todayStr, createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), userId, title: "Bought a super squeaky toy mouse 🐭",
      amount: -4.55, type: "cat_toy", notes: "It's grey and has shiny feather ears, it is so fun!",
      date: todayStr, createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), userId, title: "Yummy Crispy Salmon treats 🐟",
      amount: -2.30, type: "cat_treat", notes: "Perfect crunchy treats to snack on after doing my math!",
      date: todayStr, createdAt: new Date().toISOString(),
    },
  ];

  db.tasks.push(...sampleTasks);
  db.habits.push(...sampleHabits);
  db.goals.push(...sampleGoals);
  db.reminders.push(...sampleReminders);
  if (!db.exercises) db.exercises = [];
  db.exercises.push(...sampleExercises);
  if (!db.journals) db.journals = [];
  db.journals.push(...sampleJournals);
  if (!db.budgets) db.budgets = [];
  db.budgets.push(...sampleBudgets);
}

let dbInitialized = false;

export async function ensureDB() {
  if (dbInitialized) return;
  try {
    await initSQLite();
    const initialDB = readSQLiteDB();
    const defaultEmail = "janetiozon1@gmail.com";

    let dbModified = false;
    Object.keys(initialDB.users).forEach((id) => {
      const u = initialDB.users[id];
      if (u.name === "Janet Iozon" || u.email.toLowerCase() === defaultEmail.toLowerCase()) {
        if (u.name !== "Shinderu") {
          u.name = "Shinderu";
          dbModified = true;
        }
      }
    });

    const defaultUserHash = Object.keys(initialDB.users).find(
      (id) => initialDB.users[id].email.toLowerCase() === defaultEmail.toLowerCase()
    );

    if (!defaultUserHash) {
      const seedId = crypto.randomUUID();
      initialDB.users[seedId] = {
        id: seedId,
        email: defaultEmail,
        name: "Shinderu",
        passwordHash: hashPassword("password"),
        productivityScore: 78,
        joinedAt: new Date().toISOString(),
      };
      seedUserData(seedId, defaultEmail, initialDB);
      writeSQLiteDB(initialDB);
      console.log("Seeded database with default user:", defaultEmail);
    } else if (dbModified) {
      writeSQLiteDB(initialDB);
      console.log("Migrated existing default user to named 'Shinderu'");
    }
    dbInitialized = true;
  } catch (err) {
    console.error("Database initialization failed (will retry on next request):", err);
  }
}
