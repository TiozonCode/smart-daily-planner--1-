import { useState, useEffect } from "react";
import { 
  PiggyBank, 
  Plus, 
  Minus, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Coins, 
  Heart,
  ToyBrick
} from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";
import { BudgetTransaction } from "../types";
import canvasConfetti from "canvas-confetti";
import budgetWealthCat from "../assets/images/budget_wealth_cat_1782193990477.jpg";

interface BudgetSectionProps {
  token: string;
}

export default function BudgetSection({ token }: BudgetSectionProps) {
  const [budgets, setBudgets] = useState<BudgetTransaction[]>([]);
  const [title, setTitle] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [selectedType, setSelectedType] = useState<BudgetTransaction["type"]>("allowance");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isDeposit, setIsDeposit] = useState(true); // true = Earned, false = Spent
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const categories: Array<{ id: BudgetTransaction["type"]; label: string; emoji: string; color: string; badge: string }> = [
    { id: "allowance", label: "Weekly Allowance", emoji: "🪙", color: "text-amber-400", badge: "bg-amber-500/10 border-amber-500/20 text-amber-300" },
    { id: "cat_treat", label: "Yummy Treat", emoji: "🐟", color: "text-pink-400", badge: "bg-pink-500/10 border-pink-500/20 text-pink-300" },
    { id: "cat_toy", label: "Cat Toy", emoji: "🐭", color: "text-teal-400", badge: "bg-teal-500/10 border-teal-500/20 text-teal-300" },
    { id: "learning_craft", label: "School & Craft", emoji: "🎨", color: "text-purple-400", badge: "bg-purple-500/10 border-purple-500/20 text-purple-300" },
    { id: "game_other", label: "Games & Other", emoji: "🧸", color: "text-sky-400", badge: "bg-sky-500/10 border-sky-500/20 text-sky-300" }
  ];

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/budgets", {
        headers: { "Authorization": token }
      });
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
      }
    } catch (err) {
      console.error("Error loading budget logs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [token]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amountInput.trim()) return;

    let baseAmount = parseFloat(amountInput);
    if (isNaN(baseAmount) || baseAmount <= 0) return;

    // Negate if spent money
    const finalAmount = isDeposit ? baseAmount : -baseAmount;

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          title,
          amount: finalAmount,
          type: selectedType,
          notes,
          date
        })
      });

      if (res.ok) {
        setTitle("");
        setAmountInput("");
        setNotes("");
        setShowAddForm(false);
        fetchBudgets();

        // Trigger starry feedback
        canvasConfetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.8 },
          colors: isDeposit ? ["#fbbf24", "#34d399", "#f59e0b"] : ["#f472b6", "#c084fc"]
        });
      }
    } catch (err) {
      console.error("Could not write transaction log", err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if (res.ok) {
        fetchBudgets();
      }
    } catch (err) {
      console.error("Failed to delete budget item", err);
    }
  };

  // Compute metrics
  const totalBalance = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalDeposited = budgets.filter(b => b.amount > 0).reduce((sum, b) => sum + b.amount, 0);
  const totalWithdrawn = Math.abs(budgets.filter(b => b.amount < 0).reduce((sum, b) => sum + b.amount, 0));

  // Kid goal (savings target progress bar)
  const savingsGoal = 50.00; 
  const targetPercent = Math.min(100, Math.max(0, (totalBalance / savingsGoal) * 100));

  return (
    <div className="space-y-6" id="budget-main-container">
      {/* Visual Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-teal-500/10 p-6 border border-slate-850">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-24 w-24 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shrink-0 shadow-lg shadow-amber-500/10">
              <img 
                src={budgetWealthCat} 
                alt="Budget Wealth Cat" 
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="max-w-md space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 py-1 px-3 text-amber-300 border border-amber-500/20 text-xs font-bold font-sans">
                <Sparkles className="h-3.5 w-3.5 animate-bounce" />
                My Piggy Bank Savings Tracker
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Kitty Pocket Money 🪙</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Your coin counting companion is here to keep track of your daily allowances, plan special treats or toys, and reach your fun savings goals!
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center h-24 w-24 shrink-0 bg-slate-950/60 rounded-2xl border border-amber-500/10 p-1 overflow-hidden self-center relative">
            {/* Lottie Piggy Bank */}
            <Player
              autoplay
              loop
              src="https://lottie.host/80e3599b-fe72-4058-b118-2423bb0d7ed4/lKizJp8VfX.json" // standard piggy bank coin drop
              style={{ height: '90px', width: '90px' }}
            />
          </div>
        </div>
      </div>

      {/* Bento Stats display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total balance card */}
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900/60 border border-indigo-900/35 p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-400 flex items-center gap-1">
              <PiggyBank className="h-3.5 w-3.5" />
              My Total Pocket Savings
            </span>
            <h3 className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
              <span className="text-amber-400 font-mono">₱{totalBalance.toFixed(2)}</span>
            </h3>
          </div>

          {/* Goal progress */}
          <div className="mt-5 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">Target to Buy Toys Extra pack (₱50)</span>
              <span className="text-amber-400 font-mono">{targetPercent.toFixed(0)}% Fill!</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-900 overflow-hidden p-[2px]">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-teal-400 transition-all duration-1000"
                style={{ width: `${targetPercent}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-slate-500 leading-tight block">
              {totalBalance >= savingsGoal 
                ? "🎉 Fantastic job! You have filled your piggy bank and reached your reward! Meow!" 
                : `Keep going! Only ₱${(savingsGoal - totalBalance).toFixed(2)} left to hit your goal.`}
            </span>
          </div>
        </div>

        {/* Total Earned */}
        <div className="rounded-2xl bg-slate-900/30 border border-slate-850 p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Total Earned/Saved
          </span>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-white font-mono">₱{totalDeposited.toFixed(2)}</h3>
            <p className="text-[9px] text-slate-550 mt-1">Collected from weekly allowance or doing home chores.</p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="rounded-2xl bg-slate-900/30 border border-slate-850 p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-pink-400 flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            Spent on Treats & Toys
          </span>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-white font-mono">₱{totalWithdrawn.toFixed(2)}</h3>
            <p className="text-[9px] text-slate-550 mt-1">Treats bought and super squeaky toys packs.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: action panels */}
        <div className="xl:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-350 tracking-wider uppercase flex items-center justify-between">
              <span>Change Coin Logs</span>
              <Coins className="h-4 w-4 text-amber-500" />
            </h3>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {showAddForm ? "Close Ledger Book" : "Add Earned / Spent Transaction 🪙"}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddTransaction} className="rounded-2xl border-2 border-amber-500/40 bg-slate-900/60 p-5 space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-400" />
                Add to your piggy bank:
              </h3>

              {/* Toggle Deposits vs Withdraw */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeposit(true);
                    setSelectedType("allowance");
                  }}
                  className={`py-2 rounded-lg text-center text-xs font-bold transition-all ${
                    isDeposit 
                      ? "bg-emerald-500 text-slate-950 scale-102" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ➕ Saved & Earned
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeposit(false);
                    setSelectedType("cat_treat");
                  }}
                  className={`py-2 rounded-lg text-center text-xs font-bold transition-all ${
                    !isDeposit 
                      ? "bg-pink-500 text-slate-950 scale-102" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ➖ Bought Something
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-900 py-1.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Label / Description</label>
                <input
                  type="text"
                  required
                  placeholder={isDeposit ? "e.g., Weekly Allowance or cleaned bedroom" : "e.g., Bought salmon treat stick"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-900 py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount (₱)</label>
                <div className="relative mt-1">
                  <span className="absolute top-2.5 left-3.5 text-xs text-slate-500 font-bold">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="2.50"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-900 py-2 pl-7 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
                  />
                </div>
              </div>

              {/* Category picker */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">What category matches?</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => {
                    const active = selectedType === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setSelectedType(c.id)}
                        className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-xl border transition-all ${
                          active
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 border-none text-slate-950 font-bold"
                            : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        <span>{c.emoji}</span>
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Kitty notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Grandma gave me extra coins!"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-900 py-1.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase hover:opacity-90 active:scale-98 transition-all"
              >
                🪙 Stamp inside Piggy Bank! 🐾
              </button>
            </form>
          )}
        </div>

        {/* Right: history logs */}
        <div className="xl:col-span-8">
          {isLoading ? (
            <div className="flex h-56 flex-col items-center justify-center gap-3">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></span>
              <p className="text-xs text-slate-500">Opening kitty coin chest...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-600">
                <PiggyBank className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Your piggy bank is completely empty!</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 leading-normal">
                No coin logs found. Tap "Add Earned / Spent Transaction" to collect your first coins!
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-850 bg-slate-900/25 overflow-hidden">
              <div className="p-4 border-b border-slate-850 bg-slate-900/50 flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Pocket Money Ledger</h4>
                <span className="text-[9px] font-mono font-bold text-slate-500">{budgets.length} ledger sheets</span>
              </div>

              <div className="divide-y divide-slate-850/60">
                {budgets.map((b) => {
                  const catObj = categories.find(c => c.id === b.type);
                  const isPositive = b.amount > 0;
                  return (
                    <div key={b.id} className="p-4 hover:bg-slate-900/35 transition flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border shrink-0 text-lg ${catObj ? catObj.badge : "bg-slate-950 border-slate-900"}`}>
                          {catObj ? catObj.emoji : "💵"}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white leading-snug truncate">{b.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 text-amber-500/80" />
                              {b.date}
                            </span>
                            {b.notes && (
                              <span className="text-[9px] text-slate-500 italic truncate max-w-[150px] md:max-w-[250px]">
                                • {b.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-sm font-black font-mono leading-none ${isPositive ? "text-emerald-400" : "text-pink-400"}`}>
                          {isPositive ? "+" : "-"}₱{Math.abs(b.amount).toFixed(2)}
                        </span>

                        <button
                          onClick={() => handleDeleteTransaction(b.id)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-500/10 hover:text-rose-400 transition"
                          title="Erase transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
