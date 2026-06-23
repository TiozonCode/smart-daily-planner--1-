import { useState, useEffect } from "react";
import { Sparkles, Loader2, ArrowRightCircle, AlertTriangle, CalendarRange, Clock, CheckSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AIRecommendation } from "../types";
import aiAssistantCat from "../assets/images/ai_assistant_cat_1782194016072.jpg";

export default function AIAssistantSection() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const loadingPhrases = [
    "Analyzing task attributes and urgency weights...",
    "Querying the Gemini prioritizer brain...",
    "Drafting your personalized chronological workflow...",
    "Synthesizing focus tips to sustain maximum momentum...",
    "Finalizing hourly timeblocks alignment..."
  ];

  useEffect(() => {
    let intervalId: any;
    if (loading) {
      setLoadingMessage(loadingPhrases[0]);
      let index = 1;
      intervalId = setInterval(() => {
        setLoadingMessage(loadingPhrases[index % loadingPhrases.length]);
        index++;
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [loading]);

  const fetchPrioritization = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("planner_token") || "";
      const res = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to generate intelligent AI prioritization.");
      }

      const data = await res.json();
      setRecommendation(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please ensure your Gemini secret is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Context Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row items-center gap-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-teal-500/5 blur-3xl"></div>
        <div className="h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shrink-0 shadow-lg shadow-teal-500/5">
          <img 
            src={aiAssistantCat} 
            alt="AI Assistant Cat" 
            className="h-full w-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-1.5 md:text-left text-center">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-1.5">
            Gemini Assistant Brain 🐾
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Your high-tech cyberpunk scheduling companion has calibrated intelligence directly to your task data. Analyze workloads, configure chronological priority orders, and maintain high efficiency.
          </p>
        </div>
      </div>
      
      {/* Overview */}
      <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-400" />
            AI priorizations & custom workflow
          </h2>
          <p className="text-xs text-slate-400">Leverage Gemini's intelligence to optimize your workloads, order schedules, and maintain active streak checkpoints.</p>
        </div>

        <button
          onClick={fetchPrioritization}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 py-2.5 px-5 text-xs font-bold text-[#ffffff] shadow-lg shadow-teal-500/15 transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Generating Schedule..." : "Evaluate & Prioritize Roadmap"}
        </button>
      </div>

      {/* Main recommendation display boards */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">Gemini is compiling your roadmap...</p>
            <p className="text-xs text-teal-400 italic font-mono">{loadingMessage}</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-center text-xs text-rose-400 space-y-2">
          <p>{error}</p>
          <button
            onClick={fetchPrioritization}
            className="rounded-lg bg-rose-500/20 py-1.5 px-3 border border-rose-500/40 text-[10px] font-bold text-rose-300 hover:bg-rose-500/35 transition"
          >
            Retry Request
          </button>
        </div>
      ) : !recommendation ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 space-y-4 max-w-2xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-300">Ready for Intelligent Analysis</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Click the prioritize button above. Gemini will evaluate all incomplete tasks, factor categories, check deadline limits, and calculate an optimized daily calendar roadmap.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left Col: Explanations and warnings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Priortization Explanation Markdown */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 space-y-3">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Cognitive Strategy Recommendation
              </h3>
              <div className="text-xs text-slate-300 leading-relaxed font-sans pr-1">
                <ReactMarkdown>{recommendation.explanation}</ReactMarkdown>
              </div>
            </div>

            {/* Suggested hour schedule timeline list */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarRange className="h-4.5 w-4.5 text-indigo-400" />
                Hourly Calendar Integration Timeblocks
              </h3>

              <div className="relative border-l border-slate-800 pl-4 space-y-6 ml-2 pt-2">
                {recommendation.suggestedSchedule.map((sched, idx) => (
                  <div key={idx} className="relative">
                    {/* Ring timeline marker */}
                    <span className="absolute -left-[21.5px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-950 border border-indigo-500 ring-2 ring-slate-950"></span>
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-black text-indigo-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {sched.time}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate max-w-md">{sched.taskTitle}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{sched.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Col: Recommended Order summary lists and Urgent Alerts */}
          <div className="space-y-6">
            
            {/* Recommended order */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <CheckSquare className="h-4 w-4 text-teal-400" />
                Optimal chronological Order
              </h3>

              <div className="space-y-2">
                {recommendation.recommendedOrder.map((taskTitle, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl bg-slate-950/80 p-3 border border-slate-800/40">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-[10px] font-bold text-teal-400 font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 truncate">{taskTitle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Deadline warnings list */}
            <div className="rounded-2xl border border-slate-850/60 bg-yellow-500/[0.01] p-6 space-y-4 border-yellow-500/20">
              <h3 className="text-sm font-bold text-yellow-500 flex items-center gap-2 border-b border-yellow-500/10 pb-2.5">
                <AlertTriangle className="h-4 w-4" />
                Streak Gaps & Urgent Warnings
              </h3>

              <div className="space-y-2.5">
                {recommendation.warnings.map((warn, index) => (
                  <div key={index} className="rounded-xl bg-yellow-500/5 p-3 border border-yellow-500/10 text-[11px] text-yellow-500/80 leading-relaxed font-sans">
                    {warn}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
