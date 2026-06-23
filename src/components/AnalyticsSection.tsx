import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { CheckCircle2, Flame, Award, TrendingUp, BarChart2 } from "lucide-react";
import analyticsStatsCat from "../assets/images/analytics_stats_cat_1782194030100.jpg";

interface AnalyticsSectionProps {
  stats: {
    score: number;
    completedTasksCount: number;
    totalTasksCount: number;
    maxStreak: number;
    habitSuccessRate: number;
    goalsRate: number;
    trend: Array<{ day: string; date: string; tasks: number; habits: number }>;
  };
}

export default function AnalyticsSection({ stats }: AnalyticsSectionProps) {
  
  // Custom tooltips for nice slate formatting matching the theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-xl backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">{label}</p>
          <div className="mt-1 space-y-1">
            {payload.map((p: any, i: number) => (
              <p key={i} className="text-xs font-bold font-sans" style={{ color: p.color }}>
                {p.name}: {p.value} Done
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">

      {/* Page Context Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row items-center gap-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-teal-500/5 blur-3xl"></div>
        <div className="h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shrink-0 shadow-lg shadow-teal-500/5">
          <img 
            src={analyticsStatsCat} 
            alt="Analytics Stats Cat" 
            className="h-full w-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-1.5 md:text-left text-center">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-1.5">
            Statistical Insights Hub 🐾
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Your logical statistical-analyst companion measures your progress objectively. Dive deep into completion rates, study daily habit trend curves, and fine-tune your performance ratios!
          </p>
        </div>
      </div>
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Productivity Analytics Overview</h2>
        <p className="text-xs text-slate-400">Deep, analytical insights evaluating workload completions, streak success rates, and weekly consistency trends.</p>
      </div>

      {/* Numerical Index Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Productivity score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Focus Index Rating</span>
            <TrendingUp className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-black text-white">{stats.score} %</div>
            <div className="mt-1 text-xs text-slate-500 font-sans">Accumulated metric consistency score.</div>
          </div>
        </div>

        {/* Completion volume */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tasks Fulfill Rate</span>
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-black text-white">{stats.completedTasksCount} / {stats.totalTasksCount}</div>
            <div className="mt-1 text-xs text-slate-500 font-sans">Completed vs total assigned tasks count.</div>
          </div>
        </div>

        {/* Max streak */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Max Streaks Ticked</span>
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-black text-white">{stats.maxStreak} Days</div>
            <div className="mt-1 text-xs text-slate-500 font-sans">Consecutive habit progression milestone.</div>
          </div>
        </div>

        {/* Habits consistently */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Habits Consistency</span>
            <Award className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <div className="font-mono text-3xl font-black text-white">{stats.habitSuccessRate} %</div>
            <div className="mt-1 text-xs text-slate-500 font-sans">Routine checkbox completion index.</div>
          </div>
        </div>

      </div>

      {/* Visual Chart Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Weekly Task & Habit Completing Area Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/15 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-teal-400" />
            Productivity Trend: Rolling 7-Day Completion Velocity
          </h3>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontStyle="bold" tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Tasks completed" dataKey="tasks" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTasks)" />
                <Area type="monotone" name="Habit ticks" dataKey="habits" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHabits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Task Category Performance Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/15 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-400" />
            Dynamic Category Distribution Weight
          </h3>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { category: "Work", target: 4, completed: 3 },
                { category: "Health", target: 3, completed: 2 },
                { category: "Personal", target: 5, completed: 4 },
                { category: "Education", target: 2, completed: 1 },
              ]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3"/>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px" }} />
                <Bar name="Completed" dataKey="completed" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar name="Total Target" dataKey="target" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
