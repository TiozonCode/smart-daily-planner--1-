import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Heart, 
  Smile, 
  Search,
  Check,
  Cat,
  Lock,
  Unlock,
  Eye,
  KeyRound,
  X
} from "lucide-react";
import { JournalEntry } from "../types";
import canvasConfetti from "canvas-confetti";
import journalDiaryCat from "../assets/images/journal_diary_cat_1782194003987.jpg";

interface JournalSectionProps {
  token: string;
}

export default function JournalSection({ token }: JournalSectionProps) {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<JournalEntry["mood"]>("happy_cat");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Passcode diary states
  const [isLocked, setIsLocked] = useState(false);
  const [passcode, setPasscode] = useState("1234");
  
  // Unlocking modal / page states
  const [activeReadingEntry, setActiveReadingEntry] = useState<JournalEntry | null>(null);
  const [unlockPasscodeInput, setUnlockPasscodeInput] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [sessionUnlockedIds, setSessionUnlockedIds] = useState<Record<string, boolean>>({});
  const [isUnlockedPageOpened, setIsUnlockedPageOpened] = useState(false);

  const moods: Array<{ id: JournalEntry["mood"]; label: string; emoji: string; bg: string }> = [
    { id: "happy_cat", label: "Happy Kitty", emoji: "😸", bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" },
    { id: "playful_cat", label: "Playful Cat", emoji: "😽", bg: "bg-pink-500/10 border-pink-500/30 text-pink-300" },
    { id: "sleepy_cat", label: "Cozy Sleepy", emoji: "😴", bg: "bg-amber-500/10 border-amber-500/30 text-amber-300" },
    { id: "sassy_cat", label: "Cool Sassy", emoji: "😎", bg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" },
    { id: "grumpy_cat", label: "Grumpy Mew", emoji: "😿", bg: "bg-rose-500/10 border-rose-500/30 text-rose-300" },
    { id: "sparklestars", label: "Magic Dream", emoji: "✨", bg: "bg-purple-500/10 border-purple-500/30 text-purple-300" }
  ];

  const availableStickers = [
    { text: "🌟 Star Sparkle", char: "🌟" },
    { text: "🐾 Paw Prints", char: "🐾" },
    { text: "🐟 Yum Fish", char: "🐟" },
    { text: "🥛 Fresh Milk", char: "🥛" },
    { text: "🎨 Rainbow", char: "🎨" },
    { text: "🧸 Teddy Toy", char: "🧸" },
    { text: "🎈 Red Balloon", char: "🎈" },
    { text: "🍩 Pink Donut", char: "🍩" }
  ];

  const fetchJournals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/journals", {
        headers: { "Authorization": token }
      });
      if (res.ok) {
        const data = await res.json();
        setJournals(data);
      }
    } catch (err) {
      console.error("Error loading journal database", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [token]);

  const handleToggleSticker = (char: string) => {
    if (selectedStickers.includes(char)) {
      setSelectedStickers(selectedStickers.filter(s => s !== char));
    } else {
      setSelectedStickers([...selectedStickers, char]);
    }
  };

  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const matchedMoodObj = moods.find(m => m.id === selectedMood);
    const emoji = matchedMoodObj ? matchedMoodObj.emoji : "😸";

    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          title,
          content,
          mood: selectedMood,
          emoji,
          stickers: selectedStickers,
          date,
          isLocked,
          passcode: isLocked ? passcode : ""
        })
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setSelectedStickers([]);
        setSelectedMood("happy_cat");
        setIsLocked(false);
        setPasscode("1234");
        setShowAddForm(false);
        fetchJournals();

        // Trigger sparks & sound
        canvasConfetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#ec4899", "#14b8a6", "#f59e0b"]
        });
      }
    } catch (err) {
      console.error("Could not write journal", err);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    try {
      const res = await fetch(`/api/journals/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });
      if (res.ok) {
        fetchJournals();
      }
    } catch (err) {
      console.error("Failed to delete journal entry", err);
    }
  };

  const handleUnlockAttempt = () => {
    if (!activeReadingEntry) return;
    const expected = activeReadingEntry.passcode || "1234";
    if (unlockPasscodeInput.trim() === expected.trim()) {
      setSessionUnlockedIds({
        ...sessionUnlockedIds,
        [activeReadingEntry.id]: true
      });
      canvasConfetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.5 },
        colors: ["#ec4899", "#14b8a6"]
      });
      setUnlockPasscodeInput("");
      setUnlockError("");
      setIsUnlockedPageOpened(true);
    } else {
      setUnlockError("Incorrect Secret Passcode! Try again 😿");
    }
  };

  const filtered = journals.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="journal-main-container">
      {/* Top Banner section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-teal-500/15 p-6 border border-slate-800">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shrink-0 shadow-lg shadow-pink-550/10">
              <img 
                src={journalDiaryCat} 
                alt="Cozy Journal Cat" 
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="max-w-md space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/15 py-1 px-3 text-pink-300 border border-pink-500/20 text-xs font-bold font-sans">
                <Sparkles className="h-3.5 w-3.5" />
                Child Friendly Secret Diary & Stamps
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Meow Journal 🐾</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Express your feelings, save memories, and stamp stickers! Protect your private diaries with a secret **passcode pattern lock**.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left column: input and filter tools */}
        <div className="xl:col-span-4 space-y-6">
          {/* Quick Stats & Actions */}
          <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-350 tracking-wider uppercase mb-1 flex items-center justify-between">
              <span>My Diary Tools</span>
              <BookOpen className="h-4 w-4 text-pink-400" />
            </h3>

            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search matching diaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 py-3 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {showAddForm ? "Hide Writer Panel 🐾" : "Write New Secret Diary ✨"}
            </button>
          </div>

          {/* Form wrapper */}
          {showAddForm && (
            <form onSubmit={handleAddJournal} className="rounded-2xl border-2 border-pink-500/40 bg-slate-900/60 p-5 space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smile className="h-4 w-4 text-pink-400" />
                What's on your mind today?
              </h3>

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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Title of your entry</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Spent time coloring with markers!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-900 py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* Mood picker */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">My Kitty Mood Helper</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {moods.map((m) => {
                    const active = selectedMood === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setSelectedMood(m.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                          active 
                            ? "bg-pink-500/25 border-pink-500 text-pink-300 scale-102" 
                            : "bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="text-xl mb-0.5">{m.emoji}</span>
                        <span className="text-[8px] font-bold uppercase tracking-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stickers list */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stamp Stickers on Diary 🐾</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableStickers.map((s) => {
                    const active = selectedStickers.includes(s.char);
                    return (
                      <button
                        type="button"
                        key={s.text}
                        onClick={() => handleToggleSticker(s.char)}
                        className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-xl border transition-all ${
                          active
                            ? "bg-gradient-to-r from-pink-500 to-teal-400 border-none text-slate-950 font-extrabold transform scale-105"
                            : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        <span>{s.char}</span>
                        <span>{s.text.split(" ")[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Describe what happened!</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Today, me and Shinderu had a blast! Write anything you did..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-900 py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* Optional Secret Passcode Lock Toggle */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-pink-300 tracking-wider flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-pink-400" /> Secret Passcode Lock
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={isLocked}
                      onChange={(e) => setIsLocked(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500 peer-checked:after:bg-white"></div>
                  </label>
                </div>
                {isLocked && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-450">Passcode digits / Secret Key</label>
                    <input
                      type="text"
                      required={isLocked}
                      placeholder="e.g., 1234"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono tracking-widest text-center"
                    />
                    <p className="text-[9px] text-slate-500 leading-normal">Only users entering this exact secret passcode can unlock and reveal the full text inside.</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase hover:opacity-90 active:scale-98 transition-all"
              >
                🔒 Lock in Secret Diary Entry 🐾
              </button>
            </form>
          )}
        </div>

        {/* Right column: diary grid */}
        <div className="xl:col-span-8">
          {isLoading ? (
            <div className="flex h-56 flex-col items-center justify-center gap-3">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"></span>
              <p className="text-xs text-slate-500">Unpacking kitty secret keynotes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-600">
                <Cat className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Your secret diaries are empty!</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 leading-normal">
                Click "Write New Secret Diary" above to write down your dreams, funny memories, or draw cute pictures with stamps.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((j) => {
                const moodObj = moods.find(m => m.id === j.mood);
                const isEntryLocked = j.isLocked && !sessionUnlockedIds[j.id];

                return (
                  <div 
                    key={j.id} 
                    className="p-5 rounded-2xl bg-slate-900/30 border border-slate-850 hover:border-pink-500/20 hover:bg-slate-900/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{isEntryLocked ? "🔒" : j.emoji}</span>
                          <div>
                            <h4 className="text-xs font-extrabold text-white leading-tight">
                              {isEntryLocked ? "Secret Page Log" : j.title}
                            </h4>
                            <span className="text-[9px] font-bold text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Calendar className="h-2.5 w-2.5 text-pink-400" />
                              {j.date}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteJournal(j.id)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-500/10 hover:text-rose-400 transition"
                          title="Erase diary"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Content block */}
                      {isEntryLocked ? (
                        <div className="flex flex-col items-center justify-center py-4 px-3 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 space-y-2">
                          <Lock className="h-5 w-5 text-pink-400 animate-pulse" />
                          <p className="text-[9px] text-slate-400 text-center uppercase tracking-wider font-extrabold">Secret Diary Locked</p>
                          <p className="text-[8px] text-slate-500 text-center leading-normal">Tap below to enter passcode and read the page in secret.</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-350 leading-relaxed font-sans whitespace-pre-wrap line-clamp-3">
                          {j.content}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-slate-850/60 pt-3.5 flex flex-wrap gap-2 items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReadingEntry(j);
                          setUnlockPasscodeInput("");
                          setUnlockError("");
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all active:scale-95 ${
                          isEntryLocked 
                            ? "bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30"
                            : "bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300"
                        }`}
                      >
                        {isEntryLocked ? (
                          <>
                            <Lock className="h-3 w-3" /> Unlock & Read
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 text-pink-400 animate-pulse" /> Read in New Page 📖
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5 text-[9px]">
                        {moodObj && !isEntryLocked && (
                          <span className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full border ${moodObj.bg}`}>
                            <span>{moodObj.emoji}</span>
                            <span>{moodObj.label}</span>
                          </span>
                        )}

                        {!isEntryLocked && j.stickers && j.stickers.length > 0 && (
                          <div className="flex gap-1">
                            {j.stickers.slice(0, 2).map((s, index) => (
                              <span 
                                key={index} 
                                className="text-xs bg-gradient-to-tr from-pink-500/10 to-teal-400/10 border border-slate-800 p-0.5 rounded-md"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Secret Diary details "NEW PAGE" visual aspect Overlay */}
      {activeReadingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
          {activeReadingEntry.isLocked && !sessionUnlockedIds[activeReadingEntry.id] ? (
            <div className="w-full max-w-sm rounded-[24px] border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-450">
                <Lock className="h-6 w-6 animate-bounce text-pink-400" />
              </div>

              <div className="space-y-1">
                <h3 className="font-sans text-base font-extrabold text-white">Unlock Secret Page</h3>
                <p className="text-xs text-slate-400">This diary key belongs to {activeReadingEntry.title}. Please verify keycode.</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <KeyRound className="absolute top-3 left-3.5 h-4 w-4 text-slate-550" />
                  <input
                    type="password"
                    placeholder="Enter Secret Passcode"
                    value={unlockPasscodeInput}
                    onChange={(e) => {
                      setUnlockPasscodeInput(e.target.value);
                      setUnlockError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnlockAttempt();
                      }
                    }}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 pl-10 pr-3 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono tracking-widest"
                    autoFocus
                  />
                </div>

                {unlockError && (
                  <p className="text-[10px] font-bold text-rose-400">
                    {unlockError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveReadingEntry(null)}
                  className="rounded-xl border border-slate-800 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-950"
                >
                  Close Keyhole
                </button>
                <button
                  type="button"
                  onClick={handleUnlockAttempt}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-teal-400 py-2.5 text-xs font-black text-slate-950 hover:opacity-90 active:scale-95"
                >
                  Unlock 🗝️
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full max-w-lg bg-[#faf6f0] text-slate-900 rounded-3xl border-4 border-amber-900/10 p-6 md:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute top-0 left-0 w-3.5 h-full bg-gradient-to-r from-amber-900/15 via-amber-900/5 to-transparent border-r border-amber-900/5"></div>
              
              {/* Notebook design bg lines */}
              <div className="absolute inset-x-8 top-[160px] bottom-8 border-t border-amber-900/5 bg-[linear-gradient(rgba(180,120,40,0.06)_1px,transparent_1px)] bg-[size:100%_28px] pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-amber-950/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{activeReadingEntry.emoji}</span>
                    <div className="text-left">
                      <span className="font-mono text-[9px] font-black uppercase tracking-wider text-amber-800/80 bg-amber-900/10 py-0.5 px-2 rounded-full border border-amber-900/20">
                        {moods.find(m => m.id === activeReadingEntry.mood)?.label || "Cozy Log"}
                      </span>
                      <h4 className="font-sans text-xl font-black text-slate-900 mt-1 leading-tight">{activeReadingEntry.title}</h4>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveReadingEntry(null)}
                    className="rounded-full p-2 text-amber-950/55 hover:bg-amber-900/10 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-amber-800 bg-amber-900/5 p-2.5 rounded-xl border border-amber-900/15">
                  <span className="flex items-center gap-1 font-bold">
                    <Calendar className="h-3.5 w-3.5 text-amber-800" />
                    Entry Date: {activeReadingEntry.date}
                  </span>
                  {activeReadingEntry.isLocked && (
                    <span className="flex items-center gap-1 text-emerald-800 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <Unlock className="h-3 w-3 text-emerald-700 animate-pulse" /> Secret Unlocked
                    </span>
                  )}
                </div>

                {/* Content area */}
                <div className="pt-2">
                  <p className="font-sans text-[13px] text-slate-800 leading-[28px] whitespace-pre-wrap min-h-[140px] tracking-wide pl-2 border-l-2 border-pink-500/20">
                    {activeReadingEntry.content}
                  </p>
                </div>

                <div className="border-t border-amber-950/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Stamp Stickers decoration block */}
                  <div className="space-y-1.5 text-left w-full sm:w-auto">
                    <span className="block text-[8px] font-black uppercase tracking-wider text-amber-850 font-sans">Stamp Stickers Stamped</span>
                    <div className="flex gap-1.5">
                      {activeReadingEntry.stickers && activeReadingEntry.stickers.length > 0 ? (
                        activeReadingEntry.stickers.map((s, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center justify-center text-lg bg-white border border-amber-900/10 p-2 rounded-2xl shadow-sm hover:scale-110 hover:-rotate-6 transition-all"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-amber-900/30 italic">No stickers stamped.</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={journalDiaryCat}
                      alt="Writing diary illustration"
                      className="h-14 w-14 rounded-xl object-cover border border-amber-900/10 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-amber-900">Handwritten Lock 🐾</p>
                      <p className="text-[8px] text-slate-600">Your secret page is fully secure!</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setActiveReadingEntry(null)}
                    className="px-6 py-2 rounded-2xl bg-slate-900 hover:bg-slate-950 text-white text-[10px] font-black uppercase tracking-wider shadow transition"
                  >
                    Close Page & Lock Book 📖
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
