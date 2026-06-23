import { useState, useEffect } from "react";
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  Zap, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Trophy, 
  Activity, 
  Loader2, 
  Lightbulb, 
  TrendingUp, 
  Heart,
  CalendarDays,
  Utensils
} from "lucide-react";
import confetti from "canvas-confetti";
import fitnessWorkoutCat from "../assets/images/fitness_workout_cat_1782193977181.jpg";

export interface Exercise {
  id: string;
  name: string;
  category: "strength" | "cardio" | "flexibility" | "endurance";
  duration: number; // minutes
  calories: number; // kcal
  intensity: "low" | "medium" | "high";
  weight: number; // kg
  reps: number;
  sets: number;
  distance: number; // km
  notes: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
  movements?: string[];
}

interface RecommendedWorkout {
  workoutName: string;
  category: "strength" | "cardio" | "flexibility" | "endurance";
  recommendedDuration: number;
  intensity: "low" | "medium" | "high";
  estimatedCalories: number;
  exercisesList: Array<{ name: string; sets: number; reps: number; notes: string }>;
  coachingTips: string;
}

export default function ExerciseSection() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"strength" | "cardio" | "flexibility" | "endurance">("strength");
  const [duration, setDuration] = useState("30");
  const [calories, setCalories] = useState("200");
  const [intensity, setIntensity] = useState<"low" | "medium" | "high">("medium");
  const [weight, setWeight] = useState("0");
  const [reps, setReps] = useState("0");
  const [sets, setSets] = useState("0");
  const [distance, setDistance] = useState("0");
  const [notes, setNotes] = useState("");
  const [movementsInput, setMovementsInput] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Active Category filter
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // AI Recommendation states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendedWorkout | null>(null);
  const [aiPhrases, setAiPhrases] = useState("Consulting the Athletic Coach Brain...");

  const token = localStorage.getItem("planner_token") || "";

  const motivationPhrases = [
    "Analyzing your schedule workload for physical fatigue...",
    "Drafting appropriate reps and weights intensity ratios...",
    "Mapping cardio paces against cognitive pressure index...",
    "Curating active recovery sequences to lower cortisol...",
    "Balancing sweat volume and heart-rate intervals..."
  ];

  useEffect(() => {
    let intervalId: any;
    if (aiLoading) {
      setAiPhrases(motivationPhrases[0]);
      let index = 1;
      intervalId = setInterval(() => {
        setAiPhrases(motivationPhrases[index % motivationPhrases.length]);
        index++;
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [aiLoading]);

  // Load exercises from APIs
  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exercises", {
        headers: {
          "Authorization": token
        }
      });
      if (!res.ok) throw new Error("Could not retrieve exercise database.");
      const data = await res.json();
      setExercises(data);
    } catch (err: any) {
      setError(err.message || "Failed to load exercises.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExercises();
    }
  }, [token]);

  // Create Custom Exercise
  const handleAddExercise = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = {
        name,
        category,
        duration: parseInt(duration) || 0,
        calories: parseInt(calories) || 0,
        intensity,
        weight: category === "strength" ? (parseFloat(weight) || 0) : 0,
        reps: category === "strength" ? (parseInt(reps) || 0) : 0,
        sets: category === "strength" ? (parseInt(sets) || 0) : 0,
        distance: category === "cardio" ? (parseFloat(distance) || 0) : 0,
        notes,
        movements: movementsInput
          .split(",")
          .map((m) => m.trim())
          .filter((m) => m.length > 0),
        date,
        completed: true
      };

      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to write exercise to backend.");
      const newEx = await res.json();
      
      setExercises((prev) => [newEx, ...prev]);
      
      // Reset custom form
      setName("");
      setDuration("30");
      setCalories("200");
      setWeight("0");
      setReps("0");
      setSets("0");
      setDistance("0");
      setNotes("");
      setMovementsInput("");
      setShowAddForm(false);

      // Trigger standard confetti
      confetti({
        particleCount: 120,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#ec4899", "#14b8a6", "#3b82f6"]
      });

    } catch (err: any) {
      alert(err.message || "Could not log workout.");
    }
  };

  // Toggle Exercise completed
  const handleToggleCompleted = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ completed: !currentStatus })
      });

      if (!res.ok) throw new Error("Failed to edit exercise status.");
      const updated = await res.json();
      
      setExercises((prev) => prev.map((ex) => ex.id === id ? updated : ex));

      if (!currentStatus) {
        confetti({
          particleCount: 80,
          spread: 40,
          origin: { y: 0.75 },
          colors: ["#ec4899", "#14b8a6"]
        });
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Delete exercise
  const handleDeleteExercise = async (id: string) => {
    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": token
        }
      });

      if (!res.ok) throw new Error("Could not remove log.");
      setExercises((prev) => prev.filter((ex) => ex.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to remove entry.");
    }
  };

  // Request AI Recommendation Workout
  const fetchAIWorkout = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/exercises/recommend", {
        method: "POST",
        headers: {
          "Authorization": token
        }
      });
      if (!res.ok) throw new Error("AI Workout Planner failed to draft sequence.");
      const data = await res.json();
      setRecommendation(data);
    } catch (err: any) {
      setAiError(err.message || "Could not construct workout prescription.");
    } finally {
      setAiLoading(false);
    }
  };

  // Quick preset template logging helper
  const handleLogPreset = async (preset: {
    name: string;
    category: "strength" | "cardio" | "flexibility" | "endurance";
    duration: number;
    calories: number;
    intensity: "low" | "medium" | "high";
    notes: string;
    movements?: string[];
  }) => {
    try {
      const payload = {
        ...preset,
        weight: 0,
        reps: 0,
        sets: 0,
        distance: preset.category === "cardio" ? 5.0 : 0,
        date: new Date().toISOString().split("T")[0],
        completed: true
      };

      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Preset log failed.");
      const newEx = await res.json();
      setExercises((prev) => [newEx, ...prev]);

      confetti({
        particleCount: 100,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#ec4899", "#06b6d4"]
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  // Log full AI generated routine quickly to database
  const handleLogRecommendation = async () => {
    if (!recommendation) return;
    try {
      const notesSummary = recommendation.exercisesList
        .map((e) => `• ${e.name}: ${e.sets}x${e.reps} (${e.notes})`)
        .join("\n");

      const payload = {
        name: recommendation.workoutName,
        category: recommendation.category,
        duration: recommendation.recommendedDuration,
        calories: recommendation.estimatedCalories,
        intensity: recommendation.intensity,
        weight: recommendation.category === "strength" ? 20 : 0,
        reps: recommendation.category === "strength" ? 12 : 0,
        sets: recommendation.category === "strength" ? 3 : 0,
        distance: recommendation.category === "cardio" ? 3.5 : 0,
        notes: notesSummary + `\n\nAI Tips: ${recommendation.coachingTips}`,
        movements: recommendation.exercisesList.map((e) => `${e.name} (${e.sets}x${e.reps})`),
        date: new Date().toISOString().split("T")[0],
        completed: true
      };

      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Could not save AI prescription.");
      const newEx = await res.json();
      setExercises((prev) => [newEx, ...prev]);
      
      // Reset AI card
      setRecommendation(null);

      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.65 },
        colors: ["#a855f7", "#ec4899", "#14b8a6"]
      });
    } catch (err: any) {
      alert(err.message || "Failed to commit AI workout.");
    }
  };

  // Calculation summaries
  const completedWorkouts = exercises.filter((ex) => ex.completed);
  const totalCalories = completedWorkouts.reduce((sum, ex) => sum + (ex.calories || 0), 0);
  const totalMinutes = completedWorkouts.reduce((sum, ex) => sum + (ex.duration || 0), 0);

  // Strength stats
  const strengthLogs = completedWorkouts.filter(ex => ex.category === "strength");
  const maxWeightLifted = strengthLogs.length > 0 ? Math.max(...strengthLogs.map(ex => ex.weight || 0)) : 0;

  const presets = [
    { 
      name: "⚡ HIIT Circuit Burn", 
      category: "endurance" as const, 
      duration: 25, 
      calories: 290, 
      intensity: "high" as const, 
      notes: "Interval based high intensity plyometrics and agility drills.",
      movements: ["Jumping Jacks", "Burpees", "High Knees", "Mountain Climbers", "Squat Jumps"]
    },
    { 
      name: "🧘 Vinyasa Yoga Stretch", 
      category: "flexibility" as const, 
      duration: 30, 
      calories: 120, 
      intensity: "low" as const, 
      notes: "Flowing sun salutations to improve static spinal and shoulder flexibilities.",
      movements: ["Sun Salutations", "Downward Facing Dog", "Warrior Pose I & II", "Bridge Pose"]
    },
    { 
      name: "🏃 Fast Lakeside Cardio", 
      category: "cardio" as const, 
      duration: 35, 
      calories: 340, 
      intensity: "high" as const, 
      notes: "Tempo paced aerobic cardio runs tracking distance pacing split intervals.",
      movements: ["Jumping Jacks (Warmup)", "Aero Cardio Jog", "Calf stretches cooldown", "Ankle mobility drills"]
    },
    { 
      name: "🏋️ Upper Body Pump", 
      category: "strength" as const, 
      duration: 40, 
      calories: 260, 
      intensity: "medium" as const, 
      notes: "Bench press, single-arm seated rows, barbell curls, and pushdowns.",
      movements: ["Incline Bench Press", "Seated Cable Row", "Barbell Bicep Curls", "Tricep Pushdowns"]
    }
  ];

  // Exercises filtered list
  const filteredExercises = exercises.filter((ex) => {
    if (filterCategory === "all") return true;
    return ex.category === filterCategory;
  });

  return (
    <div className="space-y-6">

      {/* Page Context Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row items-center gap-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-pink-500/5 blur-3xl"></div>
        <div className="h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shrink-0 shadow-lg shadow-pink-500/5">
          <img 
            src={fitnessWorkoutCat} 
            alt="Fitness Workout Cat" 
            className="h-full w-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-1.5 md:text-left text-center">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-1.5">
            FitPlanner: Workouts & Wellness 🐾
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Your energetic stretching companion is here to keep you strong and physical. Log routine workout counts, complete flexibility stretches, and consult our schedule-adaptive AI recommendation for customized fatigue relief!
          </p>
        </div>
      </div>
      
      {/* Header Info */}
      <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-pink-500 animate-pulse animate-duration-1000" />
            Active Workouts & Exercises
          </h2>
          <p className="text-xs text-slate-400">
            Log routine sweat counts, explore custom templates, and get schedule-adaptive physical routine recommendations from Gemini AI!
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-pink-500/10 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel Logging" : "Log a Workout"}
        </button>
      </div>

      {/* KPI Cards Panel */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/15 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block leading-normal">COMPLETED</span>
            <span className="text-xl font-extrabold text-white leading-none font-sans mt-0.5 block">{completedWorkouts.length} <span className="text-xs font-normal text-slate-400">sessions</span></span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/15 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block leading-normal">SWEAT ENERGY</span>
            <span className="text-xl font-extrabold text-white leading-none font-sans mt-0.5 block">{totalCalories} <span className="text-xs font-normal text-slate-400">kcal</span></span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/15 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block leading-normal">ACTIVE CLOCK</span>
            <span className="text-xl font-extrabold text-white leading-none font-sans mt-0.5 block">{totalMinutes} <span className="text-xs font-normal text-slate-400">minutes</span></span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/15 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block leading-normal">PEAK STRENGTH</span>
            <span className="text-xl font-extrabold text-white leading-none font-sans mt-0.5 block">{maxWeightLifted > 0 ? `${maxWeightLifted} kg` : "No weights yet"}</span>
          </div>
        </div>

      </div>

      {/* AI Trainer Section */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 p-6 space-y-4">
        <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
          <div className="flex items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: "14s" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">AI Fitness Coach & Adaptive Routine Prescriptions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects directly to your Cat Planner! Generates cardio, strength, or recovery exercises tuned specifically to relieve schedule fatigue.
              </p>
            </div>
          </div>
          <button
            onClick={fetchAIWorkout}
            disabled={aiLoading}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border border-purple-400/20 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md shadow-purple-500/5 select-none"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                Coach evaluating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-yellow-350 fill-yellow-400/20" />
                Ask Assistant Coach
              </>
            )}
          </button>
        </div>

        {aiLoading && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-300 animate-pulse">{aiPhrases}</p>
              <span className="text-[10px] text-slate-500 block mt-1 tracking-wider uppercase font-mono">Generative Gemini model orchestration</span>
            </div>
          </div>
        )}

        {aiError && (
          <div className="rounded-xl border border-rose-950/40 bg-rose-950/10 p-4 text-xs text-rose-400 font-medium">
            ⚠️ {aiError}
          </div>
        )}

        {recommendation && !aiLoading && (
          <div className="rounded-xl border border-purple-500/35 bg-slate-950/80 p-5 space-y-4 shadow-xl relative overflow-hidden animate-fadeIn">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col gap-2 justify-between sm:flex-row sm:items-center border-b border-slate-800/50 pb-3">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-purple-400 font-bold uppercase block">AI PHYSICAL THERAPY RECOMMENDATION</span>
                <h4 className="text-base font-extrabold text-white mt-0.5">{recommendation.workoutName}</h4>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold uppercase tracking-wider">
                <Flame className="h-3.5 w-3.5" />
                {recommendation.category} • {recommendation.recommendedDuration} mins
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              
              <div className="md:col-span-2 space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scheduled Physical Acts</h5>
                <div className="space-y-2">
                  {recommendation.exercisesList.map((mv, i) => (
                    <div key={i} className="flex gap-2.5 p-3 rounded-lg bg-slate-900/40 border border-slate-850">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 font-bold text-[10px]">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{mv.name}</span>
                          <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-500/5 py-0.5 px-1.5 rounded">{mv.sets} sets x {mv.reps} reps</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{mv.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/30 border border-slate-800/40 p-4 space-y-3">
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                    Coach's Schedule Guidance
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5">
                    {recommendation.coachingTips}
                  </p>
                </div>

                <div className="border-t border-slate-800/40 pt-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Cardiac Burn:</span>
                    <span className="font-bold text-white font-mono">~{recommendation.estimatedCalories} kcal</span>
                  </div>
                  <div className="flex justify-between text-[11px] mt-1">
                    <span className="text-slate-500">Intensity Load:</span>
                    <span className="font-bold text-purple-300 uppercase tracking-wide font-mono text-[10px]">{recommendation.intensity}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogRecommendation}
                  className="w-full py-2 bg-purple-500 hover:bg-purple-600 font-bold text-center text-white text-xs rounded-xl shadow transition cursor-pointer select-none"
                >
                  📥 Save AI Workout as Completed
                </button>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Log Workout Form */}
      {showAddForm && (
        <form onSubmit={handleAddExercise} className="rounded-2xl border border-slate-850 bg-slate-900/40 p-6 space-y-4 max-w-xl animate-fadeIn">
          <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4 w-4" /> Define Physical Activity Log
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Name</label>
              <input
                type="text"
                placeholder="e.g. Back squats, Sprint intervals, Yoga stretch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="strength">Strength & Weight</option>
                <option value="cardio">Aerobic Cardio</option>
                <option value="flexibility">Flexibility & Stretching</option>
                <option value="endurance">Endurance & HIIT</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration (mins)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Est. Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                min="0"
                className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Logged</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as any)}
                className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="low">Low Intensity</option>
                <option value="medium">Medium Intensity</option>
                <option value="high">High Intensity</option>
              </select>
            </div>
          </div>

          {/* Conditional block for Strength */}
          {category === "strength" && (
            <div className="grid gap-4 grid-cols-3 p-3 rounded-xl bg-slate-950/40 border border-slate-900 animate-slideDown">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Barbell/Dumbbell Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                  className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sets</label>
                <input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  min="0"
                  className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Reps (per set)</label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  min="0"
                  className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
            </div>
          )}

          {/* Conditional block for Cardio */}
          {category === "cardio" && (
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 animate-slideDown max-w-xs">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Distance Travelled (km)</label>
              <input
                type="number"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                min="0"
                className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Exercise Details / Specific Moves (e.g. jumping jacks, squats, ect..)</label>
            <input
              type="text"
              placeholder="Separate with commas, e.g. jumping jacks, squats, pushups, lunges"
              value={movementsInput}
              onChange={(e) => setMovementsInput(e.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-1.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Movements Notes / Muscular Feeling</label>
            <textarea
              rows={2}
              placeholder="Felt solid strength during sets, shoulders was a little tight..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-850 py-2.5 px-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2 bg-pink-500 hover:bg-pink-400 font-bold text-white rounded-xl text-xs transition cursor-pointer"
            >
              Log Session Completed
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-800 text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-900 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Preset templates logs */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-widest flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-pink-500" />
          Click-Log Preset Activity Templates
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {presets.map((p, i) => (
            <div
              key={i}
              onClick={() => handleLogPreset(p)}
              className="rounded-xl border border-slate-800/80 bg-slate-900/10 hover:bg-slate-900/25 p-3 flex flex-col justify-between cursor-pointer group transition hover:border-pink-500/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-pink-400 transition truncate">{p.name}</span>
                  <Zap className="h-3 w-3 text-amber-400 fill-amber-400/20" />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal mt-1 line-clamp-2">{p.notes}</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/40 mt-2 pt-2">
                <span className="text-[10px] font-mono text-slate-400 font-medium capitalize">{p.category}</span>
                <span className="text-[10px] font-mono text-pink-400 font-semibold">{p.duration}m • {p.calories}kcal</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Workout Logs */}
      <div className="space-y-4">
        
        {/* Category Filters bar */}
        <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center border-b border-slate-800/60 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">Workout Training Ledger</h3>
          </div>
          <div className="flex flex-wrap gap-1">
            {["all", "strength", "cardio", "flexibility", "endurance"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold capitalize transition select-none ${
                  filterCategory === cat
                    ? "bg-pink-500/10 text-pink-400 border-pink-500/30"
                    : "border-slate-800/50 text-slate-500 hover:text-slate-300 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-slate-550" />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="rounded-2xl border border-slate-850 p-10 text-center">
            <TrendingUp className="h-8 w-8 text-slate-650 mx-auto" />
            <h4 className="text-slate-350 text-sm font-bold mt-2">No exercise logs found</h4>
            <p className="text-slate-500 text-xs mt-1">Select a category or click any Quick Preset above to track your fitness gains!</p>
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className={`rounded-2xl p-4 border transition flex flex-col justify-between ${
                  ex.completed
                    ? "bg-slate-900/10 border-slate-800/80"
                    : "bg-slate-900/4 border-slate-850 border-dashed"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCompleted(ex.id, ex.completed)}
                        className="text-slate-500 hover:text-pink-400 transition"
                        title={ex.completed ? "Mark as Planned" : "Mark as Completed"}
                      >
                        {ex.completed ? (
                          <CheckCircle className="h-4 w-4 text-pink-500 fill-pink-500/10" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <h4 className={`text-xs font-bold leading-none ${ex.completed ? "text-white" : "text-slate-400 line-through"}`}>
                        {ex.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleDeleteExercise(ex.id)}
                      className="text-slate-600 hover:text-rose-450 transition"
                      title="Delete activity log"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Detail pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="text-[8px] font-extrabold tracking-wider uppercase bg-slate-950/45 px-1.5 py-0.5 rounded border border-slate-800/50 text-slate-400">
                      {ex.category}
                    </span>
                    <span className="text-[8px] font-mono font-bold bg-slate-950/45 px-1.5 py-0.5 rounded border border-slate-800/50 text-pink-400">
                      ⏱️ {ex.duration} mins
                    </span>
                    <span className="text-[8px] font-mono font-bold bg-slate-950/45 px-1.5 py-0.5 rounded border border-slate-800/50 text-amber-500">
                      🔥 {ex.calories} kcal
                    </span>
                    {ex.category === "strength" && (ex.weight > 0 || ex.sets > 0) && (
                      <span className="text-[8px] font-mono font-bold bg-slate-950/45 px-1.5 py-0.5 rounded border border-slate-800/50 text-purple-400">
                        🏋️ {ex.sets}x{ex.reps} @ {ex.weight}kg
                      </span>
                    )}
                    {ex.category === "cardio" && ex.distance > 0 && (
                      <span className="text-[8px] font-mono font-bold bg-slate-950/45 px-1.5 py-0.5 rounded border border-slate-800/50 text-teal-400">
                        🏃 {ex.distance} km
                      </span>
                    )}
                  </div>

                  {ex.movements && ex.movements.length > 0 && (
                    <div className="mt-3 space-y-1.5 rounded-xl bg-slate-950/25 p-2.5 border border-slate-800/40">
                      <span className="text-[9px] font-extrabold tracking-wider text-pink-400 uppercase block mb-1">
                        🎯 Specific Drills & Exercises:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ex.movements.map((move, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-pink-500/5 text-pink-300 border border-pink-500/10 font-medium"
                          >
                            <span className="w-1 h-1 rounded-full bg-pink-400 shrink-0"></span>
                            {move}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ex.notes && (
                    <div className="bg-slate-950/30 rounded-lg p-2 text-[9px] text-slate-450 border border-slate-900/60 leading-normal mt-2.5 font-sans whitespace-pre-wrap">
                      {ex.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-850/50 mt-3 pt-2">
                  <span className="text-[8px] font-mono text-slate-500 font-semibold uppercase flex items-center gap-1">
                    <CalendarDays className="h-2.5 w-2.5 text-slate-550" />
                    {ex.date}
                  </span>
                  <span className={`text-[8px] font-bold tracking-wider uppercase px-1 py-0.5 rounded ${
                    ex.intensity === "high" 
                      ? "text-rose-400 bg-rose-500/5" 
                      : ex.intensity === "medium" 
                      ? "text-amber-400 bg-amber-500/5" 
                      : "text-teal-400 bg-teal-500/5"
                  }`}>
                    {ex.intensity} Load
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
