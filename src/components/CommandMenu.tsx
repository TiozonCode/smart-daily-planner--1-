import { useState, useEffect, useRef } from "react";
import {
  Search,
  Sparkles,
  CheckSquare,
  LayoutDashboard,
  Flame,
  Award,
  Dumbbell,
  BookOpen,
  PiggyBank,
  CalendarRange,
  Activity,
  Paintbrush,
  Keyboard,
  Plus,
  Coins,
  ChevronRight,
  CornerDownLeft,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DiscordTheme, DiscordThemeInfo } from "../App";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onChangeTab: (tab: string) => void;
  onAddTask: (title: string, priority?: 'high' | 'medium' | 'low') => Promise<void>;
  onAddTaskTrigger: () => void;
  availableThemes: DiscordThemeInfo[];
  currentTheme: DiscordTheme;
  onChangeTheme: (theme: DiscordTheme) => void;
  onShowHelp: () => void;
  token: string | null;
}

type MenuMode = "normal" | "create_task" | "log_savings" | "select_theme";

export default function CommandMenu({
  isOpen,
  onClose,
  currentTab,
  onChangeTab,
  onAddTask,
  onAddTaskTrigger,
  availableThemes,
  currentTheme,
  onChangeTheme,
  onShowHelp,
  token
}: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<MenuMode>("normal");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Create task priority state
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>("medium");
  // Log savings metadata
  const [isDeposit, setIsDeposit] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Autofocus search input when menu opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setMode("normal");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Mode changes reset select index
  useEffect(() => {
    setSelectedIndex(0);
  }, [mode]);

  if (!isOpen) return null;

  // Primary Action Handler to execute commands
  const handleExecuteCommand = async (cmdId: string) => {
    switch (cmdId) {
      // Navigation
      case "nav-dashboard":
        onChangeTab("dashboard");
        onClose();
        break;
      case "nav-tasks":
        onChangeTab("tasks");
        onClose();
        break;
      case "nav-habits":
        onChangeTab("habits");
        onClose();
        break;
      case "nav-goals":
        onChangeTab("goals");
        onClose();
        break;
      case "nav-exercise":
        onChangeTab("exercise");
        onClose();
        break;
      case "nav-journal":
        onChangeTab("journal");
        onClose();
        break;
      case "nav-budget":
        onChangeTab("budget");
        onClose();
        break;
      case "nav-calendar":
        onChangeTab("calendar");
        onClose();
        break;
      case "nav-assistant":
        onChangeTab("assistant");
        onClose();
        break;
      case "nav-analytics":
        onChangeTab("analytics");
        onClose();
        break;

      // Sub-modes
      case "action-create-task":
        setMode("create_task");
        setQuery("");
        break;
      case "action-log-savings":
        setMode("log_savings");
        setQuery("");
        break;
      case "action-select-theme":
        setMode("select_theme");
        setQuery("");
        break;

      // Help Dialog
      case "action-shortcuts-guide":
        onShowHelp();
        onClose();
        break;

      // Quick tab activation form trigger
      case "action-tasks-full-form":
        onChangeTab("tasks");
        onAddTaskTrigger();
        onClose();
        break;

      default:
        break;
    }
  };

  // Submit in nested modes
  const handleNestedSubmit = async () => {
    if (!query.trim()) return;

    if (mode === "create_task") {
      await onAddTask(query.trim(), taskPriority);
      setQuery("");
      setMode("normal");
      onClose();
    } else if (mode === "log_savings") {
      const amount = parseFloat(query);
      if (!isNaN(amount) && amount > 0 && token) {
        try {
          const finalVal = isDeposit ? amount : -amount;
          await fetch("/api/budgets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token
            },
            body: JSON.stringify({
              title: isDeposit ? "Quick Saved Allowance" : "Quick Treat Expense",
              amount: finalVal,
              type: isDeposit ? "allowance" : "cat_treat",
              notes: "Logged instantly via cosmic global Command Menu",
              date: new Date().toISOString().split("T")[0]
            })
          });
          // Simple visual refresh if user is currently watching budget screen
          if (currentTab === "budget") {
            window.location.reload();
          }
        } catch (e) {
          console.error(e);
        }
      }
      setQuery("");
      setMode("normal");
      onClose();
    }
  };

  // Define Normal Mode List items
  const commandsList = [
    // Navigation Category
    { id: "nav-dashboard", category: "Navigate Apps", title: "Go to Dashboard", subtitle: "Main visual control room overview", shortcut: "D", icon: LayoutDashboard },
    { id: "nav-tasks", category: "Navigate Apps", title: "Go to Tasks Planner", subtitle: "Organize productivity task lists", shortcut: "T", icon: CheckSquare },
    { id: "nav-habits", category: "Navigate Apps", title: "Go to Atomic Habits", subtitle: "Maintain recurring streak metrics", shortcut: "H", icon: Flame },
    { id: "nav-goals", category: "Navigate Apps", title: "Go to Daily Metrics (Goals)", subtitle: "Configure status goals variables", shortcut: "G", icon: Award },
    { id: "nav-exercise", category: "Navigate Apps", title: "Go to Fitness Workouts", subtitle: "Log athletic and calorie goals", shortcut: "F", icon: Dumbbell },
    { id: "nav-journal", category: "Navigate Apps", title: "Go to Secret Diary", subtitle: "Save cute daily journal files", shortcut: "J", icon: BookOpen },
    { id: "nav-budget", category: "Navigate Apps", title: "Go to Kitty Piggy Bank", subtitle: "Deposit allowance and spent treats", shortcut: "P", icon: PiggyBank },
    { id: "nav-calendar", category: "Navigate Apps", title: "Go to Unified Calendar", subtitle: "Sync events and schedules grid", shortcut: "C", icon: CalendarRange },
    { id: "nav-assistant", category: "Navigate Apps", title: "Go to AI Priorities", subtitle: "Access smart AI scheduling advice", shortcut: "A", icon: Sparkles },
    { id: "nav-analytics", category: "Navigate Apps", title: "Go to Analytics & Stats", subtitle: "Assess historical graphs and scores", shortcut: "Y", icon: Activity },

    // Interactive Actions Center
    { id: "action-create-task", category: "Instant Actions", title: "Create Task Instantly...", subtitle: "Enter title here to save task without leaving page", shortcut: "Ctrl+K -> Enter", icon: Plus },
    { id: "action-tasks-full-form", category: "Instant Actions", title: "Open New Task Planner Form", subtitle: "Go to Tasks page and pop open details form", shortcut: "N", icon: CheckSquare },
    { id: "action-log-savings", category: "Instant Actions", title: "Log Custom Money Saving...", subtitle: "Quick record a budget change with numeric float", shortcut: "₱", icon: Coins },

    // Core Settings
    { id: "action-select-theme", category: "App Customization", title: "Switch Background Theme...", subtitle: "Select alternative Discord system skin skins", shortcut: "Paintbrush", icon: Paintbrush },

    // Meta / Help
    { id: "action-shortcuts-guide", category: "System Help", title: "Display Shortcuts Guide", subtitle: "Browse full list of developer key combo maps", shortcut: "?", icon: Keyboard }
  ];

  // Filtering based on Query
  let filteredItems: any[] = [];
  if (mode === "normal") {
    filteredItems = commandsList.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
  } else if (mode === "select_theme") {
    filteredItems = availableThemes.map((t) => ({
      id: `theme-${t.id}`,
      category: "Select Theme Skins",
      title: `${t.name}`,
      subtitle: t.description,
      shortcut: t.type === "dark" ? "Dark" : "Light",
      bgPreview: t.bg,
      accentColor: t.accent,
      action: () => {
        onChangeTheme(t.id);
        onClose();
      },
      icon: Paintbrush
    })).filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (mode !== "normal") {
        setMode("normal");
        setQuery("");
      } else {
        onClose();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const limit = mode === "normal" || mode === "select_theme" ? filteredItems.length : 0;
        return limit > 0 ? (prev + 1) % limit : 0;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const limit = mode === "normal" || mode === "select_theme" ? filteredItems.length : 0;
        return limit > 0 ? (prev - 1 + limit) % limit : 0;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (mode === "normal") {
        if (filteredItems[selectedIndex]) {
          handleExecuteCommand(filteredItems[selectedIndex].id);
        }
      } else if (mode === "select_theme") {
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else {
        handleNestedSubmit();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      const activeChild = listElement.children[selectedIndex] as HTMLElement;
      if (activeChild) {
        const containerTop = listElement.scrollTop;
        const containerBottom = containerTop + listElement.clientHeight;
        const elemTop = activeChild.offsetTop;
        const elemBottom = elemTop + activeChild.clientHeight;

        if (elemTop < containerTop) {
          listElement.scrollTop = elemTop;
        } else if (elemBottom > containerBottom) {
          listElement.scrollTop = elemBottom - listElement.clientHeight;
        }
      }
    }
  }, [selectedIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 font-sans">
      {/* Dark overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        id="cmd-menu-backdrop"
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm"
      />

      {/* Floating container body */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        ref={containerRef}
        id="cmd-menu-container"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-[1px] shadow-2xl shadow-teal-500/10"
      >
        <div className="rounded-3xl bg-slate-950 border border-slate-900 overflow-hidden">
          {/* Top input bar header wrapper */}
          <div className="relative border-b border-slate-900 bg-slate-900/10 px-5 py-4 flex items-center gap-3">
            <Search className="h-4.5 w-4.5 text-slate-500 shrink-0" />
            
            {/* Input with reactive custom placeholder depending on mode */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "normal"
                  ? "Search commands or navigate tabs..."
                  : mode === "create_task"
                  ? "Enter task title..."
                  : mode === "log_savings"
                  ? "Enter numeric amount (₱)..."
                  : "Search theme presets..."
              }
              id="cmd-menu-search-input"
              className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder-slate-600 font-medium"
            />

            {/* Hint badges depending on context */}
            <div className="flex items-center gap-1.5 shrink-0">
              {mode !== "normal" && (
                <button
                  onClick={() => {
                    setMode("normal");
                    setQuery("");
                  }}
                  className="rounded px-1.5 py-0.5 border border-slate-800 hover:bg-slate-900 text-[9px] font-mono font-bold text-slate-500 hover:text-white transition cursor-pointer"
                >
                  [Esc] Back
                </button>
              )}
              <span className="rounded-md border border-slate-800 bg-slate-900 py-1 px-1.5 text-[9px] font-black font-mono text-slate-500 flex items-center gap-0.5 select-none leading-none">
                {mode === "normal" && "CMD"}
                {mode === "create_task" && "TASK"}
                {mode === "log_savings" && "POCKET"}
                {mode === "select_theme" && "THEME"}
                <CornerDownLeft className="h-2.5 w-2.5" />
              </span>
            </div>
          </div>

          {/* Subheader controls for nested configurations */}
          {mode === "create_task" && (
            <div className="px-5 py-2.5 bg-slate-900/20 border-b border-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium">Define Task Urgency Priority Tier:</span>
              <div className="flex items-center gap-1" id="cmd-priority-selector">
                {(["high", "medium", "low"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTaskPriority(p)}
                    className={`rounded-lg px-2.5 py-1 font-bold text-[9px] uppercase tracking-wide border transition ${
                      taskPriority === p
                        ? p === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-1 ring-rose-500/10' :
                          p === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                          'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-transparent text-slate-500 border-transparent hover:text-slate-350'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "log_savings" && (
            <div className="px-5 py-2.5 bg-slate-900/20 border-b border-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium">Log Type Transaction:</span>
              <div className="flex items-center gap-1.5" id="cmd-budget-type-selector">
                <button
                  onClick={() => setIsDeposit(true)}
                  className={`rounded-lg px-2.5 py-1 font-bold text-[9px] uppercase tracking-wide border transition ${
                    isDeposit
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-transparent text-slate-500 border-transparent'
                  }`}
                >
                  Earned / Savings (+)
                </button>
                <button
                  onClick={() => setIsDeposit(false)}
                  className={`rounded-lg px-2.5 py-1 font-bold text-[9px] uppercase tracking-wide border transition ${
                    !isDeposit
                      ? 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                      : 'bg-transparent text-slate-500 border-transparent'
                  }`}
                >
                  Spent on Treat (-)
                </button>
              </div>
            </div>
          )}

          {/* Interactive Dynamic Core Command List viewport */}
          <div
            ref={listRef}
            id="cmd-menu-items-list"
            className="max-h-[340px] overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-[140px]"
          >
            {mode === "normal" || mode === "select_theme" ? (
              filteredItems.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-1.5">
                  <span className="text-slate-500 text-xs">No matching commands, sections, or settings found.</span>
                  <span className="text-[10px] text-slate-600 font-mono">Query: "{query}"</span>
                </div>
              ) : (
                filteredItems.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const active = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        if (mode === "normal") {
                          handleExecuteCommand(cmd.id);
                        } else {
                          cmd.action();
                        }
                      }}
                      id={`cmd-menu-item-${cmd.id}`}
                      className={`w-full text-left rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 transition cursor-pointer ${
                        active
                          ? "bg-slate-900 border-slate-800 ring-1 ring-teal-500/10"
                          : "bg-transparent border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* Custom icon circular frame */}
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            active
                              ? "bg-teal-500/20 text-teal-400"
                              : "bg-slate-950 text-slate-500 border border-slate-900"
                          }`}
                        >
                          {/* If select_theme mode, render theme color dot container */}
                          {cmd.bgPreview ? (
                            <span
                              className="h-3 w-3 rounded-full flex items-center justify-center shadow-inner"
                              style={{ backgroundColor: cmd.bgPreview }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cmd.accentColor }}></span>
                            </span>
                          ) : (
                            <Icon className="h-4.5 w-4.5" />
                          )}
                        </div>

                        {/* Text and category label */}
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-250 truncate">{cmd.title}</span>
                            {!cmd.bgPreview && (
                              <span className="text-[8px] font-black font-mono tracking-wider text-slate-600 uppercase">
                                {cmd.category}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate leading-relaxed mt-0.5">
                            {cmd.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Right shortcut guide indicator */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {active && (
                          <motion.span
                            initial={{ x: -2, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-teal-400 bg-teal-500/10 p-0.5 rounded"
                          >
                            <CornerDownLeft className="h-3 w-3" />
                          </motion.span>
                        )}
                        {cmd.shortcut && (
                          <kbd className="inline-flex min-w-4 items-center justify-center px-1.5 py-0.5 rounded-md border border-slate-800 bg-slate-950 text-[9px] font-bold font-mono text-slate-500 select-none">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </div>
                    </button>
                  );
                })
              )
            ) : mode === "create_task" ? (
              <div className="p-4 py-8 text-center space-y-4">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                  <Plus className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">
                    {query.trim() ? `Submit Task: "${query.trim()}"` : "Instantly create a work/home task"}
                  </h4>
                  <p className="text-[10px] text-slate-500 max-w-sm mx-auto">
                    Type a task headline. Hit <kbd className="text-slate-400 font-mono bg-slate-900 p-0.5 rounded">Enter</kbd> to record instantly. Your task gets saved into Work Folder with due date set to today.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 text-[10px]">
                  <span className="text-slate-600">Active Priority:</span>
                  <span className={`font-black uppercase text-[10px] tracking-wide ${
                    taskPriority === 'high' ? 'text-rose-400' :
                    taskPriority === 'medium' ? 'text-yellow-500' : 'text-sky-450'
                  }`}>
                    {taskPriority} priority
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 py-8 text-center space-y-4">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Coins className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">
                    {query.trim() ? `Submit (₱${query.trim()}) Budget Entry` : "Log cash allowance / expense transaction"}
                  </h4>
                  <p className="text-[10px] text-slate-500 max-w-sm mx-auto">
                    Type a numeric amount. Hit <kbd className="text-slate-400 font-mono bg-slate-900 p-0.5 rounded">Enter</kbd> to save. Negative values are automatically handled for expenses.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Keyboard command guide footer */}
          <div className="border-t border-slate-900 bg-slate-900/10 py-2.5 px-5 flex items-center justify-between text-[10px] font-mono text-slate-650">
            <span className="flex items-center gap-1">
              <span className="flex items-center gap-0.5 font-bold">
                <kbd className="bg-slate-900 border border-slate-800 text-slate-500 px-1 rounded">↑↓</kbd>
                Navigate
              </span>
              <span className="text-slate-800 bg-transparent">|</span>
              <span className="flex items-center gap-0.5 font-bold">
                <kbd className="bg-slate-900 border border-slate-800 text-slate-500 px-1 rounded">Enter</kbd>
                Execute
              </span>
            </span>
            <span className="flex items-center gap-1 text-[9px] italic">
              Powered by Cosmic Hotkeys Guide 🐾
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
