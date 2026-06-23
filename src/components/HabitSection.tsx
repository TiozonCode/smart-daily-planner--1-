import { useState } from "react";
import { Plus, Trash2, Flame, CheckCircle, Circle, Folder, Layers, Sparkles, Archive, ArchiveRestore, AlertTriangle } from "lucide-react";
import { Habit } from "../types";
import canvasConfetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";
import habitTrackerCat from "../assets/images/habit_tracker_cat_1782193948445.jpg";

interface HabitSectionProps {
  habits: Habit[];
  onAddHabit: (name: string, category: string) => void;
  onCheckInHabit: (id: string) => Promise<any>;
  onDeleteHabit: (id: string) => void;
  onToggleArchiveHabit: (id: string) => void;
}

interface FireParticle {
  id: number;
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

export default function HabitSection({
  habits,
  onAddHabit,
  onCheckInHabit,
  onDeleteHabit,
  onToggleArchiveHabit,
}: HabitSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Health");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [celebratingHabit, setCelebratingHabit] = useState<{ name: string; streak: number } | null>(null);
  const [fireParticles, setFireParticles] = useState<FireParticle[]>([]);

  const habitToArchive = habits.find((h) => h.id === confirmArchiveId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit(name, category);
    setName("");
    setShowForm(false);
  };

  const categories = ["Health", "Education", "Personal", "Work", "Other"];
  const todayStr = new Date().toISOString().split("T")[0];

  const triggerFireCelebration = (habitName: string, streak: number) => {
    setCelebratingHabit({ name: habitName, streak });
    const particles: FireParticle[] = [];
    for (let i = 0; i < 65; i++) {
      particles.push({
        id: i,
        x: (Math.random() - 0.5) * 280,
        size: Math.random() * 12 + 8, // sizes between 8px and 20px
        color: [
          "bg-red-500 shadow-red-550/40 shadow-lg",
          "bg-orange-500 shadow-orange-550/40 shadow-lg",
          "bg-amber-500 shadow-amber-550/40 shadow-lg",
          "bg-yellow-400 shadow-yellow-450/40 shadow-lg",
          "bg-rose-500 shadow-rose-550/40 shadow-lg",
          "bg-orange-400 shadow-orange-450/40 shadow-lg"
        ][Math.floor(Math.random() * 6)],
        delay: Math.random() * 1.5,
        duration: Math.random() * 2.2 + 1.2, // 1.2s to 3.4s
      });
    }
    setFireParticles(particles);

    // Blast custom orange, red & gold fire confetti!
    canvasConfetti({
      particleCount: 140,
      spread: 85,
      origin: { y: 0.6 },
      colors: ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#ff0000"],
    });
  };

  const handleCheckIn = async (id: string, alreadyChecked: boolean) => {
    const updated = await onCheckInHabit(id);
    if (!alreadyChecked && updated) {
      if (updated.streak === 7 || (updated.streak % 7 === 0 && updated.streak > 0)) {
        triggerFireCelebration(updated.name, updated.streak);
      } else {
        canvasConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.75 },
          colors: ["#14b8a6", "#2dd4bf", "#fbbf24", "#f43f5e", "#a855f7"],
        });
      }
    }
  };

  // Helper to view last 7 days visual checklist grid
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleString("en-US", { weekday: "narrow" }),
        dateStr: d.toISOString().split("T")[0],
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <div className="space-y-6">

      {/* Page Context Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row items-center gap-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-teal-500/5 blur-3xl"></div>
        <div className="h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shrink-0 shadow-lg shadow-teal-500/5">
          <img 
            src={habitTrackerCat} 
            alt="Habit Tracker Cat" 
            className="h-full w-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-1.5 md:text-left text-center">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-1.5">
            Habit Garden 🐾
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Consistency is the water that helps routines grow. Mark habits complete everyday, grow consecutive streaks, and watch your daily routines flourish into beautiful automatic habits!
          </p>
        </div>
      </div>
      
      {/* Title block */}
      <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Atomic habits tracking</h2>
          <p className="text-xs text-slate-400 font-sans">Establish positive habits, log consecutive streaks, and monitor visual trend lines.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 py-2.5 px-4 text-xs font-semibold text-slate-900 shadow-md shadow-teal-500/10 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Atomic Habit"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Add Dynamic Routine Habit
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Habit Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Read 15 pages of philosophy"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-slate-200 outline-none focus:border-teal-400 transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Sphere Category</label>
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
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-teal-500 hover:bg-teal-400 py-2 px-5 text-xs font-bold text-slate-950 transition cursor-pointer"
            >
              Initialize Habit
            </button>
          </div>
        </form>
      )}

      {/* View Filter segmented control */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setViewMode("active")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
            viewMode === "active"
              ? "bg-slate-800/60 text-teal-400 border-teal-500/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>🎯 Active Daily Routines</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-[10px] font-mono font-bold text-slate-400">
            {habits.filter((h) => !h.isArchived).length}
          </span>
        </button>
        <button
          onClick={() => setViewMode("archived")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
            viewMode === "archived"
              ? "bg-slate-800/60 text-amber-400 border-amber-500/30"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>📁 Archived Drawer</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-[10px] font-mono font-bold text-slate-400">
            {habits.filter((h) => h.isArchived).length}
          </span>
        </button>
      </div>

      {/* Habits List Grid layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {habits.filter((h) => (viewMode === "active" ? !h.isArchived : h.isArchived)).length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-800 p-12 text-center">
            <p className="text-xs text-slate-500">
              {viewMode === "active"
                ? "No active habit routines tracking yet. Add one above to build routines!"
                : "Your archive drawer is empty. Move habits here to tidy up your daily view."}
            </p>
          </div>
        ) : (
          habits
            .filter((h) => (viewMode === "active" ? !h.isArchived : h.isArchived))
            .map((habit) => {
              const hasCheckedInToday = habit.history.includes(todayStr);

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 space-y-4 hover:border-slate-700 hover:bg-slate-900/15 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="overflow-hidden">
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-mono text-teal-400 uppercase tracking-wider">
                        {habit.category}
                      </span>
                      <h3 className="mt-1.5 text-sm font-bold text-white tracking-tight truncate">
                        {habit.name}
                      </h3>
                    </div>

                    {/* Streak displays */}
                    <motion.div
                      animate={hasCheckedInToday ? { scale: [1, 1.15, 1] } : {}}
                      className="flex items-center gap-1 shrink-0 rounded-xl bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-orange-400"
                    >
                      <Flame className="h-4 w-4 fill-orange-500/20" />
                      <span className="font-mono text-xs font-bold">{habit.streak}d streak</span>
                    </motion.div>
                  </div>

                  {/* Grid checklist list of 7 days */}
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-900 flex items-center justify-between gap-1">
                    {last7Days.map((day) => {
                      const checkedOnDate = habit.history.includes(day.dateStr);
                      const isToday = day.dateStr === todayStr;

                      return (
                        <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                          <span className={`text-[10px] font-mono ${isToday ? "text-teal-400 font-bold animate-pulse" : "text-slate-500"}`}>
                            {day.label}
                          </span>

                          {/* Interactive toggle for today only, static checklist indicator for others */}
                          {isToday ? (
                            <motion.button
                              onClick={() => handleCheckIn(habit.id, checkedOnDate)}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.85 }}
                              className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-200 border cursor-pointer ${
                                checkedOnDate
                                  ? "bg-teal-500 text-slate-950 border-teal-500 shadow-md shadow-teal-555/35"
                                  : "hover:border-teal-400 border-slate-800 bg-slate-900"
                              }`}
                            >
                              {checkedOnDate ? (
                                <CheckCircle className="h-3.5 w-3.5 font-bold" />
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                              )}
                            </motion.button>
                          ) : (
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-lg border ${
                                checkedOnDate
                                  ? "border-teal-500/40 bg-teal-500/10 text-teal-400"
                                  : "border-slate-800/40 bg-slate-900"
                              }`}
                            >
                              {checkedOnDate && <CheckCircle className="h-3 w-3" />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer and remove */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>Checked-in {habit.history.length} times</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          if (habit.isArchived) {
                            onToggleArchiveHabit(habit.id);
                          } else {
                            setConfirmArchiveId(habit.id);
                          }
                        }}
                        className={`flex items-center gap-1 transition cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800/45 ${
                          habit.isArchived
                            ? "text-amber-500 hover:text-amber-400 bg-amber-500/5"
                            : "text-slate-400 hover:text-teal-400"
                        }`}
                        title={habit.isArchived ? "Restore to active tracker" : "Archive habit"}
                      >
                        {habit.isArchived ? (
                          <>
                            <ArchiveRestore className="h-3 w-3" />
                            <span>Restore</span>
                          </>
                        ) : (
                          <>
                            <Archive className="h-3 w-3" />
                            <span>Archive</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteHabit(habit.id)}
                        className="flex items-center gap-1 hover:text-rose-400 transition cursor-pointer py-1 px-1.5 text-slate-400"
                        title="Permanently delete habit"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmArchiveId && habitToArchive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
              id="confirm-archive-modal"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <AlertTriangle className="h-6 w-6" id="alert-icon" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white tracking-tight" id="modal-title">
                  Archive Habit Routine?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed" id="modal-desc">
                  Are you sure you want to archive <strong className="text-slate-200">"{habitToArchive.name}"</strong>? This will pause your active daily tracking, but your long-term streak logs remain fully preserved in your archived drawer.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  id="cancel-archive-button"
                  onClick={() => setConfirmArchiveId(null)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:border-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-archive-button"
                  onClick={() => {
                    onToggleArchiveHabit(confirmArchiveId);
                    setConfirmArchiveId(null);
                  }}
                  className="rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition cursor-pointer"
                >
                  Yes, Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7-Day Streak Celebration Fire Particle Overlay */}
      <AnimatePresence>
        {celebratingHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
            {/* Absolute container filling the overlay for the rising fire particles */}
            <div className="absolute inset-0 pointer-events-none" id="fire-particles-container">
              {fireParticles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className={`absolute rounded-full filter blur-[1.5px] opacity-90 ${particle.color}`}
                  style={{
                    width: particle.size,
                    height: particle.size,
                    left: `calc(50% + ${particle.x}px)`,
                    bottom: `10%`,
                  }}
                  initial={{ y: 0, x: 0, scale: 0.8, opacity: 0.9 }}
                  animate={{
                    y: -1000, // rise up
                    x: particle.x + (Math.random() - 0.5) * 160, // sway left/right
                    scale: [0.8, 1.3, 0.4, 0], // scale up then dissolve
                    opacity: [0.9, 1, 0.7, 0], // fade out
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            {/* Glowing fire backdrop behind card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-orange-600/10 blur-3xl pointer-events-none"></div>

            {/* Congratulatory Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -30 }}
              transition={{ type: "spring", damping: 15 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-orange-500/30 bg-slate-900 p-8 text-center shadow-2xl shadow-orange-500/10 space-y-6"
              id="streak-celebration-card"
            >
              {/* Decorative warm particles glow internally */}
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none"></div>

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-red-500 to-amber-400 p-4 shadow-lg shadow-orange-500/20 animate-pulse">
                <Flame className="h-10 w-10 text-slate-950 fill-slate-950" id="roaring-flame-icon" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                  🔥 Productivity Milestone Unlocked 🔥
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight" id="celebration-title">
                  {celebratingHabit.streak}-Day Streak!
                </h2>
                <p className="text-sm text-slate-300 px-2 leading-relaxed" id="celebration-message">
                  Incredible dedication! You reached a <strong className="text-teal-400">{celebratingHabit.streak}-day streak</strong> on <strong className="text-white">"{celebratingHabit.name}"</strong>.
                </p>
                <p className="text-xs text-slate-400 px-4 leading-relaxed" id="celebration-subtext">
                  Your consistency is nurturing your habits into automatic routines. Keep fueling the fire!
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="celebration-dismiss-button"
                  onClick={() => setCelebratingHabit(null)}
                  className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 px-6 py-3 text-xs font-black text-slate-950 hover:brightness-110 shadow-lg shadow-orange-500/20 transition cursor-pointer transform active:scale-95"
                >
                  KEEP THE FIRE BURNING! 🔥
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
