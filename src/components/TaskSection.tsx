import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Edit2, Trash2, Calendar, Clock, Plus, Filter, Tag, ArrowUpDown, ChevronDown, ChevronUp, ListTodo, CornerDownRight, Sparkles, Palette } from "lucide-react";
import { Task, TaskPriority } from "../types";
import { motion, AnimatePresence } from "motion/react";
import cutePlanningCat from "../assets/images/cute_planning_cat_1782193755882.jpg";

function getCategoryColor(category: string, customColors?: Record<string, string>): string {
  if (!category) return "bg-slate-500/10 text-slate-400 border-slate-500/10";
  const cat = category.toLowerCase().trim();

  if (customColors && customColors[cat]) {
    const customColorVal = customColors[cat];
    switch (customColorVal) {
      case "indigo": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "teal": return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "emerald": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "amber": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "purple": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "rose": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "sky": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "fuchsia": return "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";
      case "orange": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "lime": return "bg-lime-500/10 text-lime-400 border-lime-500/20";
      case "slate": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  }

  switch (cat) {
    case "work":
    case "job":
    case "office":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "personal":
    case "life":
    case "home":
      return "bg-teal-500/10 text-teal-450 border-teal-500/20";
    case "health":
    case "fitness":
    case "exercise":
    case "sport":
      return "bg-emerald-500/10 text-emerald-450 border-emerald-500/20";
    case "financial":
    case "money":
    case "budget":
    case "savings":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "chores":
    case "house":
    case "grocery":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "urgent":
    case "important":
      return "bg-rose-500/10 text-rose-450 border-rose-500/20";
    case "academic":
    case "study":
    case "school":
    case "learn":
      return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    default: {
      const colors = [
        "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/15",
        "bg-cyan-500/10 text-cyan-400 border-cyan-500/15",
        "bg-orange-500/10 text-orange-400 border-orange-500/15",
        "bg-pink-500/10 text-pink-400 border-pink-500/15",
        "bg-lime-500/10 text-lime-450 border-lime-500/15",
        "bg-violet-500/10 text-violet-400 border-violet-500/15",
        "bg-indigo-500/10 text-indigo-405 border-indigo-500/15"
      ];
      let sum = 0;
      for (let i = 0; i < cat.length; i++) {
        sum += cat.charCodeAt(i);
      }
      return colors[sum % colors.length];
    }
  }
}

interface TaskSectionProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "userId">) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  addTaskTrigger?: number;
  token: string;
}

export default function TaskSection({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  addTaskTrigger,
  token,
}: TaskSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showColorManager, setShowColorManager] = useState(false);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("planner_task_category_colors");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleSetCategoryColor = (cat: string, colorCode: string) => {
    const updated = { ...categoryColors, [cat.toLowerCase().trim()]: colorCode };
    setCategoryColors(updated);
    localStorage.setItem("planner_task_category_colors", JSON.stringify(updated));
  };

  useEffect(() => {
    if (addTaskTrigger) {
      setShowAddForm(true);
      setEditingTask(null);
      setTimeout(() => {
        const titleEl = document.getElementById("task-title-input");
        titleEl?.focus();
      }, 100);
    }
  }, [addTaskTrigger]);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [estimatedEffort, setEstimatedEffort] = useState(30);

  // Filter/Sort states
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, completed
  const [sortBy, setSortBy] = useState<"date" | "priority" | "effort" | "smart">("date");
  const [smartSortedIds, setSmartSortedIds] = useState<string[]>([]);
  const [smartSortReasoning, setSmartSortReasoning] = useState<string>("");
  const [isSmartSorting, setIsSmartSorting] = useState(false);
  const [smartSortError, setSmartSortError] = useState<string | null>(null);

  const handleSmartSort = async () => {
    setIsSmartSorting(true);
    setSmartSortError(null);
    try {
      const res = await fetch("/api/tasks/smart-sort", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });
      if (!res.ok) {
        throw new Error("Failed to sort tasks using the smart scheduler.");
      }
      const data = await res.json();
      if (data.sortedIds) {
        setSmartSortedIds(data.sortedIds);
        setSmartSortReasoning(data.reasoning);
        setSortBy("smart");
      }
    } catch (err: any) {
      console.error(err);
      setSmartSortError(err.message || "An error occurred during smart sorting.");
    } finally {
      setIsSmartSorting(false);
    }
  };

  // Sub-steps & expandable states
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  const [newSubStepTitle, setNewSubStepTitle] = useState<Record<string, string>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    // If user clicked inside a button, checkbox/input, select, label or details editor, do not toggle expand
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea") ||
      target.closest("label") ||
      target.tagName === "A"
    ) {
      return;
    }
    setExpandedTaskIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddSubStep = (taskId: string) => {
    const text = newSubStepTitle[taskId]?.trim();
    if (!text) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentSubSteps = task.subSteps || [];
    const updatedSubSteps = [
      ...currentSubSteps,
      {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        title: text,
        completed: false,
      },
    ];

    onUpdateTask(taskId, { subSteps: updatedSubSteps });
    setNewSubStepTitle((prev) => ({ ...prev, [taskId]: "" }));
  };

  const handleToggleSubStep = (taskId: string, subStepId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubSteps = (task.subSteps || []).map((s) => {
      if (s.id === subStepId) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    onUpdateTask(taskId, { subSteps: updatedSubSteps });
  };

  const handleDeleteSubStep = (taskId: string, subStepId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubSteps = (task.subSteps || []).filter((s) => s.id !== subStepId);

    onUpdateTask(taskId, { subSteps: updatedSubSteps });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      onUpdateTask(editingTask.id, {
        title,
        description,
        category,
        priority,
        dueDate,
        estimatedEffort,
      });
      setEditingTask(null);
    } else {
      onAddTask({
        title,
        description,
        category,
        priority,
        dueDate,
        estimatedEffort,
        completed: false,
        subSteps: [],
      });
    }

    // Reset Form
    resetForm();
    setShowAddForm(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Work");
    setPriority("medium");
    setDueDate(new Date().toISOString().split("T")[0]);
    setEstimatedEffort(30);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setEstimatedEffort(task.estimatedEffort);
    setShowAddForm(true);
  };

  // Filter & Sort Logic
  const filteredTasks = tasks
    .filter((t) => {
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterStatus === "active" && t.completed) return false;
      if (filterStatus === "completed" && !t.completed) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "smart") {
        const idxA = smartSortedIds.indexOf(a.id);
        const idxB = smartSortedIds.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) {
          return idxA - idxB;
        }
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        
        // Fallback sorting: Priority followed by nearest due date
        const pValues = { high: 3, medium: 2, low: 1 };
        const diff = pValues[b.priority] - pValues[a.priority];
        if (diff !== 0) return diff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "date") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "priority") {
        const pValues = { high: 3, medium: 2, low: 1 };
        return pValues[b.priority] - pValues[a.priority];
      }
      if (sortBy === "effort") {
        return b.estimatedEffort - a.estimatedEffort;
      }
      return 0;
    });

  const categories = ["Work", "Personal", "Health", "Education", "Other"];

  return (
    <div className="space-y-6">

      {/* Page Context Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row items-center gap-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-teal-500/5 blur-3xl"></div>
        <div className="h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shrink-0 shadow-lg shadow-teal-500/5">
          <img 
            src={cutePlanningCat} 
            alt="Planning Cat" 
            className="h-full w-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-1.5 md:text-left text-center">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-1.5">
            Focus Task Hub 🐾
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Your planning companion is here to keep you structured. Break down large milestones into bite-sized tasks, estimate your energy constraints, and track sub-steps checklist to stay productive without feeling overwhelmed.
          </p>
        </div>
      </div>
      
      {/* Header and Toggle Add Action */}
      <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Tasks & Backlog</h2>
          <p className="text-xs text-slate-400">Manage, organize, and allocate estimated effort constraints to tasks and checklists.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            id="manage-colors-button"
            onClick={() => setShowColorManager(!showColorManager)}
            className={`flex items-center gap-1.5 rounded-xl py-2.5 px-4 text-xs font-semibold border transition cursor-pointer ${
              showColorManager
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <Palette className="h-4 w-4" />
            Category Colors
          </button>

          <button
            onClick={() => {
              if (showAddForm) {
                setEditingTask(null);
                resetForm();
              }
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 py-2.5 px-4 text-xs font-semibold text-slate-900 shadow-md shadow-teal-500/10 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? "Cancel Form" : "Create New Task"}
          </button>
        </div>
      </div>

      {/* Category Colors Settings Panel */}
      <AnimatePresence>
        {showColorManager && (
          <motion.div
            initial={{ opacity: 0, y: -15, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -15, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 shadow-xl"
            id="category-color-manager-panel"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="h-4 w-4 text-amber-400" />
                Customize Category Color Badges
              </h3>
              <p className="text-[10px] text-slate-500">Pick beautiful custom palettes for your tags. Changes apply instantly.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from(new Set([
                "Work",
                "Personal",
                "Health",
                "Education",
                "Other",
                ...tasks.map((t) => t.category).filter(Boolean)
              ])).map((categoryName) => {
                const currentVal = categoryColors[categoryName.toLowerCase().trim()] || "";
                return (
                  <div 
                    key={categoryName} 
                    className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3.5 flex flex-col justify-between gap-3 shadow-inner"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200 truncate">{categoryName}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none font-sans shrink-0 ${getCategoryColor(categoryName, categoryColors)}`}>
                        Preview
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { name: "indigo", bg: "bg-indigo-500" },
                        { name: "teal", bg: "bg-teal-500" },
                        { name: "emerald", bg: "bg-emerald-500" },
                        { name: "amber", bg: "bg-amber-500" },
                        { name: "purple", bg: "bg-purple-500" },
                        { name: "rose", bg: "bg-rose-500" },
                        { name: "sky", bg: "bg-sky-500" },
                        { name: "fuchsia", bg: "bg-fuchsia-500" },
                        { name: "orange", bg: "bg-orange-500" },
                        { name: "lime", bg: "bg-lime-500" },
                        { name: "slate", bg: "bg-slate-500" },
                      ].map((preset) => {
                        const isSelected = currentVal === preset.name;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleSetCategoryColor(categoryName, preset.name)}
                            title={`Set ${categoryName} to ${preset.name}`}
                            className={`h-4 w-4 rounded-full ${preset.bg} cursor-pointer transition transform hover:scale-125 focus:outline-none ${
                              isSelected 
                                ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110" 
                                : "opacity-80 hover:opacity-100"
                            }`}
                          />
                        );
                      })}
                      
                      {currentVal && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...categoryColors };
                            delete updated[categoryName.toLowerCase().trim()];
                            setCategoryColors(updated);
                            localStorage.setItem("planner_task_category_colors", JSON.stringify(updated));
                          }}
                          className="text-[10px] text-slate-500 hover:text-slate-300 font-medium pl-1 transition pointer-events-auto cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Creation Form (collapsible) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -15, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -15, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">
              {editingTask ? "📝 Edit Task Item" : "✨ Create New Productivity Task"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Task Title</label>
                  <input
                    type="text"
                    id="task-title-input"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Deliver database schema draft review"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-slate-200 outline-none focus:border-teal-400 transition"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Outline step-by-step subtasks..."
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3.5 text-xs text-slate-200 outline-none focus:border-teal-400 transition resize-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Tag</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-2 text-xs text-slate-300 focus:border-teal-400 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority Tier</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-2 text-xs text-slate-300 focus:border-teal-400 outline-none"
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-2 text-xs text-slate-300 focus:border-teal-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Effort (Minutes)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={480}
                    step={5}
                    value={estimatedEffort}
                    onChange={(e) => setEstimatedEffort(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-2 text-xs text-slate-300 focus:border-teal-400 outline-none"
                  />
                </div>
              </div>

            </div>

            <div className="flex gap-2 justify-end border-t border-slate-800/60 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  resetForm();
                  setShowAddForm(false);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 py-2 px-4 text-xs font-medium text-slate-400 transition"
              >
                Close
              </button>
              <button
                type="submit"
                className="rounded-xl bg-teal-500 hover:bg-teal-400 py-2 px-5 text-xs font-bold text-slate-950 transition"
              >
                {editingTask ? "Save Edits" : "Launch Task"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter and Control Rack */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-4 flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 p-1 px-2 border border-slate-800">
            <Tag className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">📁 All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 p-1 px-2 border border-slate-800">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">🔥 All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Complete Status */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 p-1 px-2 border border-slate-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">⚡ All Progress</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>
        </div>

        {/* Sort option and Smart Sort action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Smart Sort trigger button */}
          <button
            onClick={handleSmartSort}
            disabled={isSmartSorting}
            className={`flex items-center gap-1.5 rounded-xl py-1 px-3 text-xs font-semibold border transition ${
              sortBy === "smart"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                : "bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-purple-400 border-slate-800"
            }`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${isSmartSorting ? "animate-spin text-purple-400" : "text-purple-405"}`} />
            {isSmartSorting ? "Sorting..." : "Smart Sort 🧠"}
          </button>

          <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 p-1 px-2 border border-slate-800">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="date">📅 Sort by Due Date</option>
              <option value="priority">🔴 Sort by Priority</option>
              <option value="effort">⏰ Sort by Effort</option>
              {smartSortedIds.length > 0 && (
                <option value="smart">🧠 Smart AI Prioritized</option>
              )}
            </select>
          </div>
        </div>

      </div>

      {/* Smart Sort Error */}
      {smartSortError && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-450">
          ⚠️ {smartSortError}
        </div>
      )}

      {/* Smart Sort Reasoning Card */}
      {sortBy === "smart" && smartSortReasoning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-purple-500/20 bg-slate-900/40 p-5 space-y-2 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl"></div>
          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
            🧠 AI Scheduler Optimizer
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed pl-1">
            {smartSortReasoning}
          </p>
        </motion.div>
      )}

      {/* Inner Tasks List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              key="empty-state"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-dashed border-slate-800 p-12 text-center"
            >
              <p className="text-xs text-slate-500">No matching tasks located. Create one to begin organizing.</p>
            </motion.div>
          ) : (
            filteredTasks.map((t) => {
              const isExpanded = !!expandedTaskIds[t.id];
              const subStepsList = t.subSteps || [];
              const completedSubSteps = subStepsList.filter((s) => s.completed).length;
              const totalSubSteps = subStepsList.length;

              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: t.completed ? 0.7 : 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ duration: 0.22, type: "spring", stiffness: 350, damping: 26 }}
                  onClick={(e) => toggleExpand(t.id, e)}
                  className={`flex flex-col gap-3 rounded-2xl border transition p-4 bg-slate-900/10 cursor-pointer ${
                    t.completed
                      ? "border-slate-800/40 opacity-70"
                      : isExpanded
                      ? "border-teal-550 bg-slate-900/30 shadow-lg shadow-teal-500/5"
                      : "border-slate-800/60 hover:border-slate-800 hover:bg-slate-900/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(t.id);
                      }}
                      className="mt-1 shrink-0 text-slate-500 hover:text-teal-400 transition"
                    >
                      {t.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-teal-400" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    {/* Task Details Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <h4 className={`text-sm font-semibold selection:bg-slate-800 truncate ${t.completed ? "text-slate-500 line-through font-normal" : "text-white"}`}>
                            {t.title}
                          </h4>
                          {t.category && (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border leading-none font-sans shrink-0 ${getCategoryColor(t.category, categoryColors)}`}>
                              <Tag className="h-2 w-2" />
                              {t.category}
                            </span>
                          )}
                          {totalSubSteps > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-300 border border-slate-700/40 shrink-0">
                              <ListTodo className="h-2.5 w-2.5 text-teal-400" />
                              {completedSubSteps}/{totalSubSteps} steps
                            </span>
                          )}
                        </div>
                        
                        {/* Indicators info */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span className={`rounded-xl px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${
                            t.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            t.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          }`}>
                            {t.priority}
                          </span>
                        </div>
                      </div>

                      {t.description && (
                        <p className={`mt-1.5 text-xs text-slate-400/80 leading-relaxed max-w-2xl break-words ${isExpanded ? "" : "line-clamp-2"}`}>{t.description}</p>
                      )}

                      {/* Clock / Due date footer indicators */}
                      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500 font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
                          <span>Due: {t.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-600" />
                          <span>Estimated: {t.estimatedEffort} mins</span>
                        </div>
                      </div>
                    </div>

                    {/* CRUD + Expand Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0 self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTaskIds((prev) => ({ ...prev, [t.id]: !prev[t.id] }));
                        }}
                        className="rounded-lg hover:bg-slate-800 p-2 text-slate-400 hover:text-teal-400 transition"
                        title={isExpanded ? "Collapse task" : "Expand task"}
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-teal-400" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(t);
                        }}
                        className="rounded-lg hover:bg-slate-800 p-2 text-slate-400 hover:text-teal-400 transition"
                        title="Edit task parameters"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(t.id);
                        }}
                        className="rounded-lg hover:bg-slate-800 p-2 text-slate-400 hover:text-rose-400 transition"
                        title="Remove task permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable sub-steps section container */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden border-t border-slate-800/60 mt-2 pt-4 space-y-4"
                      >
                        {/* Sub-steps title & stats */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                          <h5 className="text-[11px] font-black uppercase tracking-wider text-teal-400 flex items-center gap-1">
                            <ListTodo className="h-3.5 w-3.5 text-teal-400" /> Checklist & Context Steps
                          </h5>
                          {totalSubSteps > 0 && (
                            <span className="text-[10px] font-medium text-slate-400">
                              {completedSubSteps} of {totalSubSteps} completed ({Math.round((completedSubSteps / totalSubSteps) * 100)}%)
                            </span>
                          )}
                        </div>

                        {/* Progress bar info */}
                        {totalSubSteps > 0 && (
                          <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                              style={{ width: `${(completedSubSteps / totalSubSteps) * 100}%` }}
                            />
                          </div>
                        )}

                        {/* Checklist items list */}
                        {subStepsList.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic pl-1">No checklist sub-steps prepared. Append some below to begin organizing.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {subStepsList.map((s) => (
                              <div
                                key={s.id}
                                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-850 bg-slate-950/40 py-2 px-3 hover:border-slate-800 transition"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleSubStep(t.id, s.id);
                                    }}
                                    className="text-slate-500 hover:text-teal-400 transition shrink-0"
                                  >
                                    {s.completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-teal-400" />
                                    ) : (
                                      <Circle className="h-4 w-4" />
                                    )}
                                  </button>
                                  <span className={`text-xs break-words ${s.completed ? "text-slate-500 line-through font-normal" : "text-slate-300"}`}>
                                    {s.title}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSubStep(t.id, s.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 rounded-lg hover:bg-slate-800 p-1 text-slate-500 hover:text-rose-450 transition shrink-0"
                                  title="Delete sub-step"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Append a new step input format */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={newSubStepTitle[t.id] || ""}
                            onChange={(e) =>
                              setNewSubStepTitle((prev) => ({
                                ...prev,
                                [t.id]: e.target.value,
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Add a step..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddSubStep(t.id);
                              }
                            }}
                            className="flex-grow rounded-xl border border-slate-850 bg-slate-950/80 py-1.5 px-3 text-xs text-slate-300 outline-none focus:border-teal-450 transition placeholder:text-slate-600"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSubStep(t.id);
                            }}
                            className="rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-teal-400 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition flex items-center gap-1 shrink-0"
                          >
                            <Plus className="h-3.5 w-3.5" /> Added Step
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
