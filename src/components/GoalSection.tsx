import { useState } from "react";
import { Plus, Trash2, Droplet, Footprints, Hourglass, Award, Star, ListPlus } from "lucide-react";
import { Goal } from "../types";
import confetti from "canvas-confetti";
import goalTelescopeCat from "../assets/images/goal_telescope_cat_1782193963008.jpg";

interface GoalSectionProps {
  goals: Goal[];
  onAddGoal: (title: string, target: number, unit: string, category: string) => void;
  onIncrementGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

export default function GoalSection({
  goals,
  onAddGoal,
  onIncrementGoal,
  onDeleteGoal,
}: GoalSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(100);
  const [unit, setUnit] = useState("units");
  const [category, setCategory] = useState("Health");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || target <= 0) return;
    onAddGoal(title, target, unit, category);
    
    // Reset Form
    setTitle("");
    setTarget(100);
    setUnit("units");
    setCategory("Health");
    setShowForm(false);
  };

  const handleIncrement = (goal: Goal, amount: number) => {
    const isAlreadyCompleted = goal.completed;
    const newCurrent = goal.current + amount;
    
    onIncrementGoal(goal.id, amount);

    // If completed just now, burst confetti fireworks!
    if (!isAlreadyCompleted && newCurrent >= goal.target) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#14b8a6", "#3b82f6", "#6366f1"],
      });
    }
  };

  // Helper icons for categories
  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "hydration":
      case "water":
        return <Droplet className="h-5 w-5 text-sky-400" />;
      case "steps":
      case "cardio":
        return <Footprints className="h-5 w-5 text-emerald-400" />;
      case "focus":
      case "screen":
        return <Hourglass className="h-5 w-5 text-indigo-400" />;
      default:
        return <Star className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Context Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row items-center gap-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-teal-500/5 blur-3xl"></div>
        <div className="h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shrink-0 shadow-lg shadow-teal-500/5">
          <img 
            src={goalTelescopeCat} 
            alt="Goal Telescope Cat" 
            className="h-full w-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-1.5 md:text-left text-center">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-1.5">
            Daily Goal Horizons 🐾
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Dream big and look up at the stars. Formulate your daily volume metric targets (like steps, water glasses, or focus hours), track real-time hydration/effort counts, and experience delightful star completions.
          </p>
        </div>
      </div>
      
      {/* Title section */}
      <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Daily Metrics & Goals</h2>
          <p className="text-xs text-slate-400">Track structural volumes (hydration, cardio steps, focus clocks) and achieve complete targets.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 py-2.5 px-4 text-xs font-semibold text-slate-900 shadow-md shadow-teal-500/10 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Goal Metric"}
        </button>
      </div>

      {/* Goal creation Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <ListPlus className="h-4 w-4" /> Define Daily Goal Metrics
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Goal Target Name</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Daily Water Target, Calories Burnt"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-slate-200 outline-none focus:border-teal-400 transition"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Quantity Target</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-2 text-xs text-slate-200 outline-none focus:border-teal-400 transition"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Label</label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="ml, steps, mins"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-2 text-xs text-slate-200 outline-none focus:border-teal-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Sphere Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-2 text-xs text-slate-300 focus:border-teal-400 outline-none"
              >
                <option value="Health">💧 Hydration / Health</option>
                <option value="Steps">🏃 steps / Cardio</option>
                <option value="Focus">🕰️ Focus blocks / Work</option>
                <option value="Other">⭐ Custom metric</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-teal-500 hover:bg-teal-400 py-2 px-5 text-xs font-bold text-slate-950 transition"
            >
              Initialize Goal Metric
            </button>
          </div>
        </form>
      )}

      {/* Daily goals items list */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-800 p-12 text-center">
            <p className="text-xs text-slate-500">No daily metric trackers active. Build one above!</p>
          </div>
        ) : (
          goals.map((g) => {
            const percentage = Math.round((g.current / g.target) * 100);
            
            // Dynamic rapid increment values based on metric units
            let incOption1 = 1;
            let incOption2 = 5;
            if (g.unit.toLowerCase() === "ml") {
              incOption1 = 250;
              incOption2 = 500;
            } else if (g.unit.toLowerCase() === "steps") {
              incOption1 = 1000;
              incOption2 = 2500;
            } else if (g.unit.toLowerCase() === "minutes" || g.unit.toLowerCase() === "mins") {
              incOption1 = 15;
              incOption2 = 30;
            }

            return (
              <div
                key={g.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 hover:border-slate-800 transition bg-slate-900/10 ${
                  g.completed ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5 bg-emerald-500/[0.01]" : "border-slate-800"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 border border-slate-800/60 ring-1 ring-slate-800/10">
                      {getCategoryIcon(g.category || g.title)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{g.category}</h3>
                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug mt-0.5">{g.title}</h4>
                    </div>
                  </div>
                  
                  {g.completed && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <Award className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>

                {/* Progress calculation info */}
                <div className="space-y-1.5">
                  <div className="flex items-end justify-between text-xs">
                    <span className="font-mono text-slate-200 font-semibold text-sm">
                      {g.current.toLocaleString()}{" "}
                      <span className="text-slate-500 text-xs font-light">/ {g.target.toLocaleString()} {g.unit}</span>
                    </span>
                    <span className={`font-mono text-xs font-black ${g.completed ? "text-emerald-400" : "text-teal-400"}`}>
                      {percentage}%
                    </span>
                  </div>
                  
                  {/* Progress Line bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        g.completed ? "bg-emerald-500" : "bg-teal-400"
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Incrementor triggers buttons and trash CRUD */}
                <div className="flex items-center justify-between gap-1 border-t border-slate-800/40 pt-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleIncrement(g, incOption1)}
                      disabled={g.completed}
                      className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 disabled:opacity-30 py-1 px-2 text-[10px] font-bold text-slate-300 transition"
                    >
                      +{incOption1.toLocaleString()}{g.unit}
                    </button>
                    <button
                      onClick={() => handleIncrement(g, incOption2)}
                      disabled={g.completed}
                      className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 disabled:opacity-30 py-1 px-2 text-[10px] font-bold text-slate-300 transition"
                    >
                      +{incOption2.toLocaleString()}{g.unit}
                    </button>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(g.id)}
                    className="rounded-lg hover:bg-slate-900 p-2 text-slate-600 hover:text-rose-400 transition inline-flex items-center"
                    title="Remove goal metric"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
