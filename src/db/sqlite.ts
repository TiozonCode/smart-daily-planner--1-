import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const DB_PATH = isVercel
  ? path.join("/tmp", "planner-db.json")
  : path.join(process.cwd(), "planner-db.json");

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

export function readSQLiteDB(): DBStructure {
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
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing JSON database", err);
  }
}
