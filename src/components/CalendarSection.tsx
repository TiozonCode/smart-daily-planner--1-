import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ClipboardList, CheckCircle2 } from "lucide-react";
import { Task, Goal, Habit } from "../types";
import cutePlanningCat from "../assets/images/cute_planning_cat_1782193755882.jpg";

interface CalendarSectionProps {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
}

export default function CalendarSection({ tasks, habits, goals }: CalendarSectionProps) {
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper date calculators
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Month configurations
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(year, month + 1, 1));
  };

  const getCalendarDays = () => {
    const calendarDays = [];
    // Pad previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        dateStr: `${year}-${String(month).padStart(2, "0")}-${String(prevMonthDays - i).padStart(2, "0")}`,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        isCurrentMonth: true,
        dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    // Pad next month days
    const totalSlots = 42; // standard 6 rows
    const remainingSlots = totalSlots - calendarDays.length;
    for (let i = 1; i <= remainingSlots; i++) {
      calendarDays.push({
        day: i,
        isCurrentMonth: false,
        dateStr: `${year}-${String(month + 2).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    return calendarDays;
  };

  const days = getCalendarDays();
  const todayStr = new Date().toISOString().split("T")[0];

  // Helper to retrieve tasks due on specific dateString
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  // Helper to retrieve checked habits on specific dateString
  const getHabitsForDate = (dateStr: string) => {
    return habits.filter((h) => h.history.includes(dateStr));
  };

  return (
    <div className="space-y-6">

      {/* Page Context Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row items-center gap-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-teal-500/5 blur-3xl"></div>
        <div className="h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shrink-0 shadow-lg shadow-teal-500/5">
          <img 
            src={cutePlanningCat} 
            alt="Calendar Companion Cat" 
            className="h-full w-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-1.5 md:text-left text-center">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-1.5">
            Calendar Roadmap 🐾
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Visualize your schedules, tasks, habit histories, and daily targets integrated into a unified chronological calendar layout. Stay on top of upcoming milestones and review your timeline with ease.
          </p>
        </div>
      </div>
      
      {/* Header and Control tabs */}
      <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Calendar Schedule</h2>
          <p className="text-xs text-slate-400">Review deadlines, complete agendas, and habit check-in distribution on calendar.</p>
        </div>
        
        {/* Toggle selectors */}
        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("month")}
            className={`rounded-lg py-1.5 px-3.5 text-xs font-semibold transition ${
              viewMode === "month" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Month View
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`rounded-lg py-1.5 px-3.5 text-xs font-semibold transition ${
              viewMode === "week" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Weekly list
          </button>
          <button
            onClick={() => setViewMode("day")}
            className={`rounded-lg py-1.5 px-3.5 text-xs font-semibold transition ${
              viewMode === "day" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Daily Agenda
          </button>
        </div>
      </div>

      {/* View layouts wrapper */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/10 p-6">
        
        {viewMode === "month" && (
          <div className="space-y-4 font-sans">
            
            {/* Month selectors */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="h-4.5 w-4.5 text-teal-400" />
                {monthNames[month]} {year}
              </h3>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="rounded-lg border border-slate-800 hover:bg-slate-850 p-1.5 text-slate-400 hover:text-white transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="rounded-lg border border-slate-800 hover:bg-slate-850 p-1.5 text-slate-400 hover:text-white transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 border-t border-slate-800/60 pt-4 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                <div key={w} className="py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {w}
                </div>
              ))}

              {days.map((d, index) => {
                const dateTasks = getTasksForDate(d.dateStr);
                const dateHabits = getHabitsForDate(d.dateStr);
                const hasDeadlines = dateTasks.length > 0;
                const matchesToday = d.dateStr === todayStr;

                return (
                  <div
                    key={index}
                    className={`min-h-[72px] rounded-xl border p-2 text-left flex flex-col justify-between transition ${
                      d.isCurrentMonth ? "bg-slate-950/20 border-slate-800/35" : "bg-slate-950/5 border-slate-900/20 opacity-30"
                    } ${matchesToday ? "ring-1 ring-teal-500 bg-teal-500/[0.01]" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-bold leading-none ${
                        matchesToday ? "text-teal-400" : d.isCurrentMonth ? "text-slate-300" : "text-slate-600"
                      }`}>
                        {d.day}
                      </span>
                      {hasDeadlines && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                      )}
                    </div>

                    {/* Micro displays of contents on hover/small */}
                    <div className="mt-1 space-y-1">
                      {dateTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`rounded px-1 py-0.5 text-[8px] font-medium leading-normal truncate ${
                            t.completed ? "bg-slate-800 text-slate-500 line-through" : "bg-teal-500/10 text-teal-400"
                          }`}
                          title={t.title}
                        >
                          t: {t.title}
                        </div>
                      ))}
                      {dateHabits.slice(0, 1).map((h) => (
                        <div
                          key={h.id}
                          className="rounded px-1 py-0.5 text-[8px] font-medium leading-normal bg-orange-500/10 text-orange-400 truncate"
                          title={h.name}
                        >
                          h: streak ticked
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {viewMode === "week" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Upcoming 7 Days Agenda</h3>
            
            <div className="space-y-4">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const dayObj = new Date();
                dayObj.setDate(dayObj.getDate() + i);
                const dStr = dayObj.toISOString().split("T")[0];
                const dayTasks = getTasksForDate(dStr);
                const dayHabits = getHabitsForDate(dStr);

                return (
                  <div key={i} className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-4">
                    <div className="flex items-center justify-between border-b border-slate-800/40 pb-2 mb-3">
                      <span className="font-sans text-xs font-bold text-teal-400 uppercase tracking-widest gap-2 flex items-center">
                        <ClipboardList className="h-3 w-3" />
                        {dayObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {dStr === todayStr && (
                        <span className="rounded-full bg-teal-500/10 text-teal-400 px-2 py-0.5 text-[9px] font-bold border border-teal-500/20 font-mono">
                          TODAY
                        </span>
                      )}
                    </div>

                    {dayTasks.length === 0 && dayHabits.length === 0 ? (
                      <p className="text-[11px] text-slate-500 font-medium">No deadlines or routines logged for this timezone block.</p>
                    ) : (
                      <div className="space-y-2">
                        {dayTasks.map((t) => (
                          <div key={t.id} className="flex items-center gap-2 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${t.completed ? "bg-slate-600" : "bg-teal-400"}`}></span>
                            <span className={`font-semibold ${t.completed ? "text-slate-500 line-through" : "text-slate-200"}`}>
                              [Task] {t.title}
                            </span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[8px] font-mono text-slate-400 ml-auto select-none uppercase">
                              {t.priority}
                            </span>
                          </div>
                        ))}
                        {dayHabits.map((h) => (
                          <div key={h.id} className="flex items-center gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            <span className="text-slate-300 font-medium">
                              [Routine checked] {h.name}
                            </span>
                            <span className="font-mono text-[9px] text-orange-400 ml-auto select-none">
                              🔥 {h.streak}d streak
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {viewMode === "day" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mb-2">
              <div>
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Active Timeline Agenda</h3>
                <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                  {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </h4>
              </div>
              <span className="rounded-xl bg-teal-500/10 border border-teal-500/20 px-3 py-1 font-mono text-xs text-teal-400 font-bold">
                Today's Target
              </span>
            </div>

            <div className="space-y-3">
              {/* Daily blocks */}
              {tasks.filter(t => t.dueDate === todayStr).length === 0 ? (
                <div className="py-12 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                  No task blocks scheduled on today's chronological timeframe. Create tasks due today to fill this itinerary.
                </div>
              ) : (
                tasks.filter(t => t.dueDate === todayStr).map((task) => (
                  <div key={task.id} className="flex gap-4 items-start rounded-xl border border-slate-800/40 bg-slate-950/40 p-4">
                    <div className="text-right shrink-0 min-w-[50px] font-mono text-xs font-bold text-slate-400">
                      9:00 AM
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-teal-400" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-700"></div>
                        )}
                        <span className={`text-sm font-bold tracking-tight ${task.completed ? "text-slate-500 line-through" : "text-white"}`}>
                          {task.title}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 pl-6 leading-relaxed">
                        {task.description || "No supplemental details active for this timeblock."} (Allocated: {task.estimatedEffort} minutes)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
