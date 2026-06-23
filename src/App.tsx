import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Activity,
  Flame,
  Award,
  CalendarRange,
  Sparkles,
  LogOut,
  User,
  BellRing,
  X,
  Menu,
  Sun,
  Moon,
  Paintbrush,
  Dumbbell,
  Cat,
  BookOpen,
  PiggyBank,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, Habit, Goal, Reminder, ReminderLog } from "./types";
import AuthPage from "./components/AuthPage";
import DashboardSection from "./components/DashboardSection";
import TaskSection from "./components/TaskSection";
import HabitSection from "./components/HabitSection";
import GoalSection from "./components/GoalSection";
import CalendarSection from "./components/CalendarSection";
import AnalyticsSection from "./components/AnalyticsSection";
import AIAssistantSection from "./components/AIAssistantSection";
import ExerciseSection from "./components/ExerciseSection";
import JournalSection from "./components/JournalSection";
import BudgetSection from "./components/BudgetSection";
import CommandMenu from "./components/CommandMenu";
import ShortcutsHelpModal from "./components/ShortcutsHelpModal";

export type DiscordTheme = 
  | "discord-dark" 
  | "discord-light" 
  | "discord-midnight" 
  | "discord-forest" 
  | "discord-sunset" 
  | "discord-sakura" 
  | "discord-sea" 
  | "discord-crimson";

export interface DiscordThemeInfo {
  id: DiscordTheme;
  name: string;
  description: string;
  bg: string;
  cardBg: string;
  accent: string;
  type: "dark" | "light";
}

const STATIC_DISCORD_THEMES: DiscordThemeInfo[] = [
  { id: "discord-dark", name: "Discord Dark (Classic)", description: "The classic Discord dark mode.", bg: "#313338", cardBg: "#2b2d31", accent: "#5865f2", type: "dark" },
  { id: "discord-light", name: "Discord Light", description: "The high contrast light mode.", bg: "#f2f3f5", cardBg: "#ffffff", accent: "#5865f2", type: "light" },
  { id: "discord-midnight", name: "Midnight (AMOLED)", description: "Extreme black theme.", bg: "#000000", cardBg: "#111214", accent: "#5865f2", type: "dark" },
  { id: "discord-forest", name: "Forest", description: "Comfortable forest green tones.", bg: "#131b19", cardBg: "#1a2421", accent: "#248046", type: "dark" },
  { id: "discord-sunset", name: "Sunset", description: "Warm twilight shades.", bg: "#1e171d", cardBg: "#251d24", accent: "#f47b67", type: "dark" },
  { id: "discord-sakura", name: "Sakura", description: "Elegant pink blossoms.", bg: "#21161c", cardBg: "#2b1e25", accent: "#eb459e", type: "dark" },
  { id: "discord-sea", name: "Sea", description: "Deep oceanic blue.", bg: "#111522", cardBg: "#161d2d", accent: "#00b0f4", type: "dark" },
  { id: "discord-crimson", name: "Crimson", description: "Rich scarlet crimson.", bg: "#1b1012", cardBg: "#231518", accent: "#ed4245", type: "dark" },
];

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut state keys
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [addTaskTrigger, setAddTaskTrigger] = useState(0);

  // States for fetching and displaying Discord themes
  const [availableThemes, setAvailableThemes] = useState<DiscordThemeInfo[]>(STATIC_DISCORD_THEMES);
  const [fetchingThemes, setFetchingThemes] = useState(false);
  const [themesFetchError, setThemesFetchError] = useState<string | null>(null);

  const [theme, setTheme] = useState<DiscordTheme>(() => {
    const saved = localStorage.getItem("planner_theme") as DiscordTheme;
    if (
      saved === "discord-dark" ||
      saved === "discord-light" ||
      saved === "discord-midnight" ||
      saved === "discord-forest" ||
      saved === "discord-sunset" ||
      saved === "discord-sakura" ||
      saved === "discord-sea" ||
      saved === "discord-crimson"
    ) {
      return saved;
    }
    return "discord-dark";
  });

  const fetchDiscordThemes = async () => {
    setFetchingThemes(true);
    setThemesFetchError(null);
    try {
      const res = await fetch("/api/discord-themes");
      if (!res.ok) throw new Error("Could not retrieve themes");
      const data = await res.json();
      setAvailableThemes(data);
      setToastAlert({
        id: "themes-fetched-succ",
        title: "Successfully fetched and loaded 8 Discord system themes template!",
        time: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      console.error("Failed to fetch Discord system themes", err);
      setThemesFetchError(err.message || "Failed to fetch themes from system backend API.");
    } finally {
      setFetchingThemes(false);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const themes: DiscordTheme[] = [
      "discord-dark",
      "discord-light",
      "discord-midnight",
      "discord-forest",
      "discord-sunset",
      "discord-sakura",
      "discord-sea",
      "discord-crimson"
    ];
    themes.forEach((t) => {
      root.classList.remove(`theme-${t}`);
    });
    root.classList.remove("light"); // Clean up old fallback light mode

    root.classList.add(`theme-${theme}`);
    
    // Set colorScheme property for native browser highlights/inputs
    if (theme === "discord-light") {
      root.style.colorScheme = "light";
      root.classList.add("light");
    } else {
      root.style.colorScheme = "dark";
    }
    localStorage.setItem("planner_theme", theme);
  }, [theme]);

  // Global Keyboard Shortcuts Event Listeners
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. Toggle Command Menu on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
        return;
      }

      // Check if user is actively entering text/input fields.
      // If yes, do not process single-key shortcuts to prevent typing interference!
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName;
        if (
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT" ||
          activeEl.getAttribute("contenteditable") === "true"
        ) {
          return;
        }
      }

      // 2. Alphanumeric Hotkeys navigation & action trigger
      const key = e.key;
      switch (key) {
        case "d":
        case "D":
          setCurrentTab("dashboard");
          break;
        case "t":
        case "T":
          setCurrentTab("tasks");
          break;
        case "h":
        case "H":
          setCurrentTab("habits");
          break;
        case "g":
        case "G":
          setCurrentTab("goals");
          break;
        case "f":
        case "F":
          setCurrentTab("exercise");
          break;
        case "j":
        case "J":
          setCurrentTab("journal");
          break;
        case "p":
        case "P":
          setCurrentTab("budget");
          break;
        case "c":
        case "C":
          setCurrentTab("calendar");
          break;
        case "a":
        case "A":
          setCurrentTab("assistant");
          break;
        case "y":
        case "Y":
          setCurrentTab("analytics");
          break;
        case "n":
        case "N":
          // Switch to tasks tab and trigger task insertion form block
          setCurrentTab("tasks");
          setAddTaskTrigger(Date.now());
          break;
        case "?":
          // Show Keyboard Shortcuts Cheatsheet Help Modal
          setIsShortcutsHelpOpen((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // Core schedules storage states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<ReminderLog[]>([]);
  const [stats, setStats] = useState<any>({
    score: 72,
    completedTasksCount: 0,
    totalTasksCount: 0,
    maxStreak: 0,
    habitSuccessRate: 80,
    goalsRate: 66,
    trend: [],
  });

  // Active in-app Toast simulation alert state
  const [toastAlert, setToastAlert] = useState<{ id: string; title: string; time: string } | null>(null);

  // Active load state
  const [appInitializing, setAppInitializing] = useState(true);

  // Authenticate checks on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("planner_token");
    const savedUser = localStorage.getItem("planner_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    // Perform initial themes API fetch
    fetchDiscordThemes();
    setAppInitializing(false);
  }, []);

  // Sync API schedules when token changes
  useEffect(() => {
    if (token) {
      loadAllPlannerData();
    }
  }, [token]);

  const loadAllPlannerData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: token };

      // Parallelize fetches
      const [tasksRes, habitsRes, goalsRes, remsRes, logsRes, statsRes] = await Promise.all([
        fetch("/api/tasks", { headers }),
        fetch("/api/habits", { headers }),
        fetch("/api/goals", { headers }),
        fetch("/api/reminders", { headers }),
        fetch("/api/notifications", { headers }),
        fetch("/api/analytics/summary", { headers })
      ]);

      const [tasksData, habitsData, goalsData, remsData, logsData, statsData] = await Promise.all([
        tasksRes.json(),
        habitsRes.json(),
        goalsRes.json(),
        remsRes.json(),
        logsRes.json(),
        statsRes.json()
      ]);

      setTasks(tasksData);
      setHabits(habitsData);
      setGoals(goalsData);
      setReminders(remsData);
      setNotifications(logsData);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading application schedules:", err);
    }
  };

  // --- CONTROLLER HANDLERS ---
  
  // Tasks handlers
  const handleAddTask = async (taskInput: Omit<Task, "id" | "userId"> | string, priorityInput?: 'high' | 'medium' | 'low') => {
    if (!token) return;
    try {
      let bodyObj;
      if (typeof taskInput === "string") {
        bodyObj = {
          title: taskInput,
          priority: priorityInput || "medium",
          dueDate: new Date().toISOString().split("T")[0],
          estimatedEffort: 30,
          category: "Work",
          description: ""
        };
      } else {
        bodyObj = taskInput;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(bodyObj),
      });

      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error("Failed to add task", e);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error("Failed to update task info", e);
    }
  };

  const handleToggleTask = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, {
        method: "POST",
        headers: { Authorization: token },
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error("Failed to toggle task", e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error("Failed to remove task info", e);
    }
  };

  // Habits handlers
  const handleAddHabit = async (name: string, category: string) => {
    if (!token) return;
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ name, category }),
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckInHabit = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/habits/${id}/checkin`, {
        method: "POST",
        headers: { Authorization: token },
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        await loadAllPlannerData();
        return updatedHabit;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleArchiveHabit = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/habits/${id}/toggle-archive`, {
        method: "POST",
        headers: { Authorization: token },
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Daily goals handlers
  const handleAddGoal = async (title: string, target: number, unit: string, category: string) => {
    if (!token) return;
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ title, target, unit, category }),
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleIncrementGoal = async (id: string, amount: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/goals/${id}/increment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reminders handlers
  const handleAddReminder = async (title: string, time: string, repeat: "none" | "daily" | "weekly", category: string) => {
    if (!token) return;
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ title, time, repeat, category }),
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleReminder = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/reminders/${id}/toggle`, {
        method: "POST",
        headers: { Authorization: token },
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (res.ok) {
        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger alarm push simulator with Toast visual alerts
  const handleTriggerReminder = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/reminders/${id}/trigger`, {
        method: "POST",
        headers: { Authorization: token },
      });
      
      const resData = await res.json();
      if (res.ok && resData.log) {
        // Toggle Toast alert popup
        setToastAlert({
          id: resData.log.id,
          title: resData.log.title,
          time: resData.log.time,
        });

        // Autoclose Toast after 6 seconds
        setTimeout(() => setToastAlert((prev) => (prev?.id === resData.log.id ? null : prev)), 6000);

        await loadAllPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignout = () => {
    localStorage.removeItem("planner_token");
    localStorage.removeItem("planner_user");
    setToken(null);
    setUser(null);
    setCurrentTab("dashboard");
  };

  // Render initialization loading screen
  if (appInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>
          <span className="text-xs font-mono">Initializing local sandbox...</span>
        </div>
      </div>
    );
  }

  // Render authorization screen if not logged in
  if (!token) {
    return <AuthPage onAuthSuccess={(usr, tkn) => {
      setUser(usr);
      setToken(tkn);
    }} />;
  }

  // Navigation menu items dictionary
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "habits", label: "Atomic Habits", icon: Flame },
    { id: "goals", label: "Daily Metrics", icon: Award },
    { id: "exercise", label: "Fitness & Workouts", icon: Dumbbell },
    { id: "journal", label: "Secret Diary", icon: BookOpen },
    { id: "budget", label: "Kitty Piggy Bank", icon: PiggyBank },
    { id: "calendar", label: "Unified Calendar", icon: CalendarRange },
    { id: "assistant", label: "AI Priorities", icon: Sparkles },
    { id: "analytics", label: "Analytics", icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-teal-500 selection:text-slate-950 antialiased">
      
      {/* Visual in-app simulated alarm Notification Toast overlay */}
      {toastAlert && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-2xl border border-teal-500/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md ring-1 ring-teal-500/20 flex gap-3 animate-bounce">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
            <BellRing className="h-5 w-5 animate-swing" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 font-mono">Reminder Alarm Triggered</span>
              <button onClick={() => setToastAlert(null)} className="text-slate-500 hover:text-white transition">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <h4 className="mt-1 text-xs font-bold text-white leading-normal">{toastAlert.title}</h4>
            <p className="mt-0.5 text-[10px] font-mono text-slate-500">Simulated alarm event fired at {toastAlert.time}</p>
          </div>
        </div>
      )}

      {/* Primary Sidebar - Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900/10 lg:flex">
        
        <div className="p-6">
          {/* Logo Branding */}
          <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-teal-400 text-slate-950">
              <Cat className="h-5 w-5 text-slate-950 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white leading-none">Cat Planner 🐾</h1>
              <span className="text-[10px] text-slate-500 font-medium">Daily Feline Orchestration</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="mt-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl py-2.5 px-3.5 text-xs font-semibold tracking-wide transition ${
                    active
                      ? "bg-teal-500 text-slate-950"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Command Launcher Box */}
          <div className="mt-5 px-1 border-t border-slate-900/60 pt-4">
            <button
              onClick={() => setIsCommandMenuOpen(true)}
              id="sidebar-cmd-menu-trigger"
              className="w-full flex items-center justify-between gap-2.5 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-950/40 hover:bg-slate-900/40 transition px-3 py-2 text-left group"
            >
              <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition min-w-0 font-sans">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">Quick Search</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0 select-none opacity-60 group-hover:opacity-100 transition" id="sidebar-shortcut-hint">
                <kbd className="bg-slate-950 border border-slate-800 text-[8px] font-bold font-mono text-slate-400 px-1 py-0.5 rounded shadow-sm leading-none">Ctrl</kbd>
                <kbd className="bg-slate-950 border border-slate-800 text-[8px] font-bold font-mono text-slate-400 px-1 py-0.5 rounded shadow-sm leading-none">K</kbd>
              </div>
            </button>
          </div>
        </div>

        {/* Theme Toggle Selection */}
        <div className="px-5 py-3 border-t border-slate-900/40 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <Paintbrush className="h-3 w-3 text-teal-400" />
              Discord Themes
            </span>
            <button
              onClick={fetchDiscordThemes}
              disabled={fetchingThemes}
              className="text-[9px] bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-extrabold px-1.5 py-0.5 rounded border border-teal-500/20 hover:border-teal-500/40 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Fetch themes template from API server"
            >
              {fetchingThemes ? (
                <span className="h-2 w-2 rounded-full border border-teal-400 border-t-transparent animate-spin inline-block"></span>
              ) : "Fetch API"}
            </button>
          </div>

          {/* Grid of colors */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {availableThemes.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={`${t.name} - ${t.description}`}
                  className={`group relative flex h-8 w-full flex-col items-center justify-between rounded-lg bg-slate-950/45 p-1 border transition hover:scale-105 select-none ${
                    active ? "border-teal-400 bg-slate-900/40 ring-1 ring-teal-500/20" : "border-slate-800/40 hover:border-slate-700/60"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full flex items-center justify-center relative shadow-inner"
                    style={{ backgroundColor: t.bg }}
                  >
                    <span className="absolute h-1 w-1 rounded-full" style={{ backgroundColor: t.accent }}></span>
                  </span>
                  <span className={`text-[7px] font-bold tracking-tight uppercase truncate max-w-full ${active ? "text-teal-400" : "text-slate-500 group-hover:text-slate-400"}`}>
                    {t.name.split(" ")[1]?.substring(0, 3) || t.name.substring(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg bg-slate-950/60 p-1.5 text-[9px] text-slate-400 font-sans border border-slate-900 flex flex-col gap-0.5 overflow-hidden">
            <div className="font-bold text-slate-300 uppercase tracking-wide truncate">
              {availableThemes.find((t) => t.id === theme)?.name || "Discord Dark"}
            </div>
            <div className="text-slate-500 leading-normal line-clamp-1 truncate">
              {availableThemes.find((t) => t.id === theme)?.description}
            </div>
          </div>
        </div>

        {/* Profile Footer Section */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden flex-grow">
              <h4 className="text-xs font-semibold text-slate-200 truncate">{user?.name || "Demo User"}</h4>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignout}
              className="rounded-lg hover:bg-slate-900 p-2 text-slate-500 hover:text-rose-400 transition"
              title="Sign out of Daily planner"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Container Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/10 px-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-pink-500 to-teal-400 text-slate-950">
              <Cat className="h-4 w-4 text-slate-950" />
            </div>
            <span className="text-xs font-bold font-mono tracking-wider uppercase text-white">Cat Planner 🐾</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-slate-800 hover:bg-slate-900 p-2 text-slate-400 transition"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </header>

        {/* Mobile Slide-out Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            
            <div className="relative flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-950 p-6 shadow-2xl">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                  <span className="text-xs font-bold font-mono text-teal-400 uppercase tracking-widest">Navigate Modules</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="mt-4 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl py-2.5 px-3.5 text-xs font-semibold tracking-wide transition ${
                          currentTab === item.id
                            ? "bg-teal-500 text-slate-950"
                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Theme toggle mobile */}
              <div className="border-t border-slate-900 pt-4 pb-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <Paintbrush className="h-3 w-3 text-teal-400" />
                    Discord System Themes
                  </span>
                  <button
                    onClick={fetchDiscordThemes}
                    disabled={fetchingThemes}
                    className="text-[9px] bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-bold px-2 py-0.5 rounded border border-teal-500/20"
                  >
                    {fetchingThemes ? "..." : "Fetch"}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {availableThemes.map((t) => {
                    const active = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex h-8 w-full flex-col items-center justify-between rounded-lg bg-slate-900 p-1 border transition ${
                          active ? "border-teal-400" : "border-slate-800"
                        }`}
                        title={t.name}
                      >
                        <span className="h-2.5 w-2.5 rounded-full flex items-center justify-center" style={{ backgroundColor: t.bg }}>
                          <span className="h-1 w-1 rounded-full" style={{ backgroundColor: t.accent }}></span>
                        </span>
                        <span className="text-[7px] font-sans text-slate-500 uppercase truncate max-w-full">
                          {t.name.split(" ")[1]?.substring(0, 3) || t.name.substring(0, 3)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile info footer inside mobile menu */}
              <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{user?.name}</h4>
                  <p className="text-[10px] text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignout}
                  className="rounded-lg hover:bg-slate-900 p-2 text-rose-450 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Content canvas viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 max-w-7xl w-full mx-auto">
          
          {currentTab === "dashboard" && (
            <DashboardSection
              tasks={tasks}
              habits={habits}
              goals={goals}
              reminders={reminders}
              notifications={notifications}
              user={user}
              productivityScore={stats.score}
              onAddTask={(ttl, prio) => handleAddTask(ttl, prio)}
              onToggleTask={handleToggleTask}
              onTriggerReminder={handleTriggerReminder}
              onChangeTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === "tasks" && (
            <TaskSection
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleTask={handleToggleTask}
              addTaskTrigger={addTaskTrigger}
              token={token}
            />
          )}

          {currentTab === "habits" && (
            <HabitSection
              habits={habits}
              onAddHabit={handleAddHabit}
              onCheckInHabit={handleCheckInHabit}
              onDeleteHabit={handleDeleteHabit}
              onToggleArchiveHabit={handleToggleArchiveHabit}
            />
          )}

          {currentTab === "goals" && (
            <GoalSection
              goals={goals}
              onAddGoal={handleAddGoal}
              onIncrementGoal={handleIncrementGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {currentTab === "exercise" && (
            <ExerciseSection />
          )}

          {currentTab === "journal" && (
            <JournalSection token={token} />
          )}

          {currentTab === "budget" && (
            <BudgetSection token={token} />
          )}

          {currentTab === "calendar" && (
            <CalendarSection
              tasks={tasks}
              habits={habits}
              goals={goals}
            />
          )}

          {currentTab === "assistant" && (
            <AIAssistantSection />
          )}

          {currentTab === "analytics" && (
            <AnalyticsSection stats={stats} />
          )}

        </main>

      </div>

      {/* Shortcuts Command Search Overlay */}
      <AnimatePresence>
        {isCommandMenuOpen && (
          <CommandMenu
            isOpen={isCommandMenuOpen}
            onClose={() => setIsCommandMenuOpen(false)}
            currentTab={currentTab}
            onChangeTab={setCurrentTab}
            onAddTask={handleAddTask}
            onAddTaskTrigger={() => setAddTaskTrigger(Date.now())}
            availableThemes={availableThemes}
            currentTheme={theme}
            onChangeTheme={setTheme}
            onShowHelp={() => setIsShortcutsHelpOpen(true)}
            token={token}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Interactive Help Cheatsheet Guide overlay */}
      <AnimatePresence>
        {isShortcutsHelpOpen && (
          <ShortcutsHelpModal
            isOpen={isShortcutsHelpOpen}
            onClose={() => setIsShortcutsHelpOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
