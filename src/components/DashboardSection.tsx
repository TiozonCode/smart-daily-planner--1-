import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock, Flame, PieChart, ShieldAlert, Zap, Plus, BellRing, Trash2 } from "lucide-react";
import { Task, Habit, Goal, Reminder, ReminderLog } from "../types";
import cutePlanningCat from "../assets/images/cute_planning_cat_1782193755882.jpg";

interface DashboardSectionProps {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  reminders: Reminder[];
  notifications: ReminderLog[];
  user: any;
  productivityScore: number;
  onAddTask: (title: string, priority: 'high' | 'medium' | 'low') => void;
  onToggleTask: (id: string) => void;
  onTriggerReminder: (id: string) => void;
  onClearNotifications?: () => void;
  onChangeTab: (tab: string) => void;
}

export default function DashboardSection({
  tasks,
  habits,
  goals,
  reminders,
  notifications,
  user,
  productivityScore,
  onAddTask,
  onToggleTask,
  onTriggerReminder,
  onChangeTab,
}: DashboardSectionProps) {
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<'high' | 'medium' | 'low'>("medium");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live timer for clock display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    onAddTask(quickTaskTitle, quickPriority);
    setQuickTaskTitle("");
  };

  // Filter tasks for today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const doneTodayCount = todayTasks.filter(t => t.completed).length;

  // Active streaks check
  const activeStreakCount = habits.filter(h => !h.isArchived && h.streak > 0).length;

  // Completed goals today
  const completedGoalsCount = goals.filter(g => g.completed).length;
  const goalsPercentage = goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  // Get current hour for greeting
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl"></div>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shrink-0 shadow-lg shadow-teal-500/5">
              <img 
                src={cutePlanningCat} 
                alt="Cute Planning Cat" 
                className="h-full w-full object-cover animate-fade-in" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-teal-400">
                Welcome Back
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
                {greeting}, {user?.name || "Productive User"}!
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Let's make today purposeful. Check out your customized AI roadmap under the Assistant tab.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-950/60 p-4 border border-slate-800 self-start md:self-auto">
            <Clock className="h-5 w-5 text-teal-400" />
            <div className="text-right">
              <div className="font-mono text-lg font-bold text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Core stats & score */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Productivity Score Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-slate-800" style={{ backgroundImage: `conic-gradient(#14b8a6 ${productivityScore}%, transparent 0)` }}>
            <div className="absolute inset-1 flex items-center justify-center rounded-full bg-slate-950">
              <span className="font-mono text-base font-bold text-teal-400">{productivityScore}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Productivity Rating</div>
            <div className="font-sans text-lg font-bold text-white mt-0.5">Focus State: {productivityScore > 80 ? "Superb" : productivityScore > 60 ? "Steady" : "Starting"}</div>
          </div>
        </div>

        {/* Completed Tasks proportion */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Today's Goals</div>
            <div className="font-sans text-lg font-bold text-white mt-0.5">
              {doneTodayCount}/{todayTasks.length} Completed
            </div>
          </div>
        </div>

        {/* Habit Streaks Counter */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
            <Flame className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Streaks</div>
            <div className="font-sans text-lg font-bold text-white mt-0.5">
              {activeStreakCount} Habits Burning
            </div>
          </div>
        </div>

        {/* Daily Goals Progress ring */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <PieChart className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Progress Ring</div>
            <div className="font-sans text-lg font-bold text-white mt-0.5">
              {goalsPercentage}% Metric Filled
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel Content Split */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Left Col: Today's High Priority and Quick task entry */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-teal-400" />
                Today's Priority Roadmap
              </h3>
              <button onClick={() => onChangeTab("tasks")} className="text-xs text-teal-400 hover:underline">
                View All
              </button>
            </div>

            {/* List */}
            {todayTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No tasks assigned for today. Add one below to kick off your flow!
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 rounded-xl bg-slate-900/50 p-3 border border-slate-800/40 relative hover:border-slate-800 transition"
                  >
                    <button
                      onClick={() => onToggleTask(t.id)}
                      className="mt-0.5 shrink-0 text-slate-500 hover:text-teal-400 transition"
                    >
                      {t.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-teal-400" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-grow">
                      <div className={`text-sm font-semibold selection:bg-slate-800 ${t.completed ? "text-slate-500 line-through font-normal" : "text-slate-200"}`}>
                        {t.title}
                      </div>
                      {t.description && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{t.description}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          t.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          t.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[9px] font-mono text-slate-500">
                          {t.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Form */}
            <form onSubmit={handleQuickAdd} className="mt-2 pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Speed add today's task..."
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  className="flex-grow rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs placeholder-slate-600 outline-none focus:border-teal-400 transition min-w-0"
                />
                <div className="flex gap-2">
                  <select
                    value={quickPriority}
                    onChange={(e: any) => setQuickPriority(e.target.value)}
                    className="flex-grow sm:flex-grow-0 rounded-xl border border-slate-800 bg-slate-950 py-2 px-2.5 text-xs text-slate-400 outline-none focus:border-teal-400"
                  >
                    <option value="high">🔥 High</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="low">🌱 Low</option>
                  </select>
                  <button
                    type="submit"
                    className="flex h-9 w-12 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Instant Scheduled reminders & Notifications */}
        <div className="space-y-6">
          
          {/* Smart automated push reminder launcher */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <BellRing className="h-4 w-4 text-teal-400" />
              Simulated Reminders Alarms
            </h3>
            
            {reminders.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">
                No reminders active. Create one inside the Reminders tab.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {reminders.map((rem) => (
                  <div key={rem.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800/40 bg-slate-900/40 p-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-200 truncate" title={rem.title}>{rem.title}</div>
                      <div className="mt-0.5 text-[10px] font-mono text-slate-500 flex flex-wrap items-center gap-1.5">
                        <span>⏰ {rem.time}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="uppercase text-teal-500/80 font-semibold">{rem.repeat}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onTriggerReminder(rem.id)}
                      className="w-full sm:w-auto shrink-0 rounded-lg hover:bg-teal-500 hover:text-slate-950 border border-teal-500/20 bg-teal-500/10 px-2.5 py-1.5 text-[10px] font-bold text-teal-400 transition text-center cursor-pointer"
                    >
                      Trigger Alarm
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-[10px] text-slate-500 leading-relaxed">
              *Reminders fire local visual push alerts automatically. Click "Trigger Alarm" to simulate real-time notification push logs inside your history.
            </p>
          </div>

          {/* Alarm History / Notification list */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-teal-400" />
                Notification Push History
              </span>
              <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-mono text-teal-400 font-bold self-start sm:self-auto">
                {notifications.length} Logs
              </span>
            </h3>

            {notifications.length === 0 ? (
              <div className="py-5 text-center text-xs text-slate-500">
                No recent reminder triggers. Set off alarms above to record logs.
              </div>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {notifications.slice(0, 5).map((log) => (
                  <div key={log.id} className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/20 flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
                      <BellRing className="h-3 w-3" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-300 break-words">{log.title}</div>
                      <div className="mt-0.5 text-[9px] font-mono text-slate-500">
                        Fired at {new Date(log.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({log.time})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
