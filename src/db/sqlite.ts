import path from "path";
import fs from "fs";

const isVercel = process.env.VERCEL === "1";

interface DBStructure {
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

let useSQLite = false;
let betterSQLite3: any = null;

export async function initSQLite(): Promise<boolean> {
  if (useSQLite) return true;
  if (isVercel) return false;
  try {
    const mod = await import("better-sqlite3");
    betterSQLite3 = mod.default || mod;
    useSQLite = true;
    return true;
  } catch (e) {
    console.log("better-sqlite3 not available, falling back to JSON file storage.");
    useSQLite = false;
    return false;
  }
}

const DB_PATH = isVercel
  ? path.join("/tmp", "planner-db.json")
  : path.join(process.cwd(), "planner-db.json");

let dbInstance: any = null;

function initSQLiteDB() {
  if (dbInstance) return dbInstance;
  const db = new betterSQLite3(path.join(process.cwd(), "planner.db"));
  db.pragma("journal_mode = WAL");

  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT,
    passwordHash TEXT, productivityScore INTEGER, joinedAt TEXT
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT NOT NULL,
    description TEXT, category TEXT, priority TEXT, dueDate TEXT,
    estimatedEffort INTEGER, completed INTEGER DEFAULT 0,
    completedAt TEXT, subSteps TEXT
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, name TEXT NOT NULL,
    category TEXT, streak INTEGER DEFAULT 0, lastCheckedIn TEXT,
    history TEXT, createdAt TEXT
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT NOT NULL,
    date TEXT, target INTEGER, current INTEGER, unit TEXT,
    category TEXT, completed INTEGER DEFAULT 0
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT NOT NULL,
    time TEXT, repeat TEXT, active INTEGER DEFAULT 1, category TEXT
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS reminder_logs (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, reminderId TEXT NOT NULL,
    checkedInAt TEXT, date TEXT
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, name TEXT NOT NULL,
    category TEXT, duration INTEGER, calories INTEGER, intensity TEXT,
    weight REAL, reps INTEGER, sets INTEGER, distance REAL,
    notes TEXT, movements TEXT, date TEXT, completed INTEGER DEFAULT 0, createdAt TEXT
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS journals (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT NOT NULL,
    content TEXT, mood TEXT, emoji TEXT, stickers TEXT,
    date TEXT, createdAt TEXT, isLocked INTEGER DEFAULT 0, passcode TEXT
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT NOT NULL,
    amount REAL, type TEXT, notes TEXT, date TEXT, createdAt TEXT
  )`);

  dbInstance = db;
  return db;
}

function convertSQLiteToJSON(db: any): DBStructure {
  const users: Record<string, any> = {};
  for (const r of db.prepare("SELECT * FROM users").all()) {
    users[r.id] = { id: r.id, email: r.email, name: r.name, passwordHash: r.passwordHash, productivityScore: r.productivityScore, joinedAt: r.joinedAt };
  }

  const parseJSON = (val: string) => { try { return JSON.parse(val || "[]") } catch { return [] } };

  const tasks = db.prepare("SELECT * FROM tasks").all().map((r: any) => ({
    id: r.id, userId: r.userId, title: r.title, description: r.description || "",
    category: r.category, priority: r.priority, dueDate: r.dueDate,
    estimatedEffort: r.estimatedEffort, completed: r.completed === 1,
    completedAt: r.completedAt, subSteps: parseJSON(r.subSteps)
  }));

  const habits = db.prepare("SELECT * FROM habits").all().map((r: any) => ({
    id: r.id, userId: r.userId, name: r.name, category: r.category,
    streak: r.streak, lastCheckedIn: r.lastCheckedIn,
    history: parseJSON(r.history), createdAt: r.createdAt
  }));

  const goals = db.prepare("SELECT * FROM goals").all().map((r: any) => ({
    id: r.id, userId: r.userId, title: r.title, date: r.date,
    target: r.target, current: r.current, unit: r.unit,
    category: r.category, completed: r.completed === 1
  }));

  const reminders = db.prepare("SELECT * FROM reminders").all().map((r: any) => ({
    id: r.id, userId: r.userId, title: r.title, time: r.time,
    repeat: r.repeat, active: r.active === 1, category: r.category
  }));

  const reminderLogs = db.prepare("SELECT * FROM reminder_logs").all().map((r: any) => ({
    id: r.id, userId: r.userId, reminderId: r.reminderId,
    checkedInAt: r.checkedInAt, date: r.date
  }));

  const exercises = db.prepare("SELECT * FROM exercises").all().map((r: any) => ({
    id: r.id, userId: r.userId, name: r.name, category: r.category,
    duration: r.duration, calories: r.calories, intensity: r.intensity,
    weight: r.weight, reps: r.reps, sets: r.sets, distance: r.distance,
    notes: r.notes, movements: parseJSON(r.movements), date: r.date,
    completed: r.completed === 1, createdAt: r.createdAt
  }));

  const journals = db.prepare("SELECT * FROM journals").all().map((r: any) => ({
    id: r.id, userId: r.userId, title: r.title, content: r.content || "",
    mood: r.mood, emoji: r.emoji, stickers: parseJSON(r.stickers),
    date: r.date, createdAt: r.createdAt, isLocked: r.isLocked === 1, passcode: r.passcode || ""
  }));

  const budgets = db.prepare("SELECT * FROM budgets").all().map((r: any) => ({
    id: r.id, userId: r.userId, title: r.title, amount: r.amount,
    type: r.type, notes: r.notes, date: r.date, createdAt: r.createdAt
  }));

  return { users, tasks, habits, goals, reminders, reminderLogs, exercises, journals, budgets };
}

function syncJSONToSQLite(db: any, data: DBStructure) {
  const transaction = db.transaction(() => {
    const ids = (arr: any[]) => arr.map((x: any) => x.id);

    db.prepare("DELETE FROM tasks").run();
    const insTask = db.prepare("INSERT OR REPLACE INTO tasks (id,userId,title,description,category,priority,dueDate,estimatedEffort,completed,completedAt,subSteps) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
    for (const t of data.tasks) insTask.run(t.id, t.userId, t.title, t.description||"", t.category||"", t.priority||"medium", t.dueDate||"", t.estimatedEffort||0, t.completed?1:0, t.completedAt||"", JSON.stringify(t.subSteps||[]));

    db.prepare("DELETE FROM habits").run();
    const insHabit = db.prepare("INSERT OR REPLACE INTO habits (id,userId,name,category,streak,lastCheckedIn,history,createdAt) VALUES (?,?,?,?,?,?,?,?)");
    for (const h of data.habits) insHabit.run(h.id, h.userId, h.name, h.category||"", h.streak||0, h.lastCheckedIn||"", JSON.stringify(h.history||[]), h.createdAt||"");

    db.prepare("DELETE FROM goals").run();
    const insGoal = db.prepare("INSERT OR REPLACE INTO goals (id,userId,title,date,target,current,unit,category,completed) VALUES (?,?,?,?,?,?,?,?,?)");
    for (const g of data.goals) insGoal.run(g.id, g.userId, g.title, g.date||"", g.target||0, g.current||0, g.unit||"", g.category||"", g.completed?1:0);

    db.prepare("DELETE FROM reminders").run();
    const insRem = db.prepare("INSERT OR REPLACE INTO reminders (id,userId,title,time,repeat,active,category) VALUES (?,?,?,?,?,?,?)");
    for (const r of data.reminders) insRem.run(r.id, r.userId, r.title, r.time||"", r.repeat||"daily", r.active?1:0, r.category||"");

    db.prepare("DELETE FROM reminder_logs").run();
    const insLog = db.prepare("INSERT OR REPLACE INTO reminder_logs (id,userId,reminderId,checkedInAt,date) VALUES (?,?,?,?,?)");
    for (const rl of data.reminderLogs) insLog.run(rl.id, rl.userId, rl.reminderId, rl.checkedInAt||"", rl.date||"");

    db.prepare("DELETE FROM exercises").run();
    const insEx = db.prepare("INSERT OR REPLACE INTO exercises (id,userId,name,category,duration,calories,intensity,weight,reps,sets,distance,notes,movements,date,completed,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    for (const e of data.exercises||[]) insEx.run(e.id, e.userId, e.name, e.category||"", e.duration||0, e.calories||0, e.intensity||"medium", e.weight||0, e.reps||0, e.sets||0, e.distance||0, e.notes||"", JSON.stringify(e.movements||[]), e.date||"", e.completed?1:0, e.createdAt||"");

    db.prepare("DELETE FROM journals").run();
    const insJ = db.prepare("INSERT OR REPLACE INTO journals (id,userId,title,content,mood,emoji,stickers,date,createdAt,isLocked,passcode) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
    for (const j of data.journals||[]) insJ.run(j.id, j.userId, j.title, j.content||"", j.mood||"", j.emoji||"", JSON.stringify(j.stickers||[]), j.date||"", j.createdAt||"", j.isLocked?1:0, j.passcode||"");

    db.prepare("DELETE FROM budgets").run();
    const insB = db.prepare("INSERT OR REPLACE INTO budgets (id,userId,title,amount,type,notes,date,createdAt) VALUES (?,?,?,?,?,?,?,?)");
    for (const b of data.budgets||[]) insB.run(b.id, b.userId, b.title, b.amount||0, b.type||"", b.notes||"", b.date||"", b.createdAt||"");
  });
  transaction();
}

export function readSQLiteDB(): DBStructure {
  if (useSQLite) {
    try {
      const db = initSQLiteDB();
      const data = convertSQLiteToJSON(db);
      if (!data.exercises) data.exercises = [];
      if (!data.journals) data.journals = [];
      if (!data.budgets) data.budgets = [];
      return data;
    } catch (err) {
      console.error("Error reading SQLite database", err);
    }
  }

  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      const data = JSON.parse(raw);
      if (!data.exercises) data.exercises = [];
      if (!data.journals) data.journals = [];
      if (!data.budgets) data.budgets = [];
      return data;
    }
  } catch (err) {
    console.error("Error reading JSON database", err);
  }
  return { users: {}, tasks: [], habits: [], goals: [], reminders: [], reminderLogs: [], exercises: [], journals: [], budgets: [] };
}

export function writeSQLiteDB(data: DBStructure) {
  if (useSQLite) {
    try {
      const db = initSQLiteDB();
      syncJSONToSQLite(db, data);
      return;
    } catch (err) {
      console.error("Error writing SQLite database", err);
    }
  }

  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing JSON database", err);
  }
}
