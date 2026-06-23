import { X, Keyboard } from "lucide-react";
import { motion } from "motion/react";

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsHelpModal({ isOpen, onClose }: ShortcutsHelpModalProps) {
  if (!isOpen) return null;

  const sections = [
    {
      title: "Global Hotkeys",
      items: [
        { keys: ["Ctrl", "K"], desc: "Toggle Command Search Menu" },
        { keys: ["?"], desc: "Show Keyboard Shortcuts Guide" },
        { keys: ["Esc"], desc: "Close Active Menu / Modal" },
      ],
    },
    {
      title: "Tab Navigation",
      subtitle: "Press when not typing in text inputs",
      items: [
        { keys: ["D"], desc: "Go to Dashboard" },
        { keys: ["T"], desc: "Go to Tasks Planner" },
        { keys: ["H"], desc: "Go to Atomic Habits" },
        { keys: ["G"], desc: "Go to Daily Metrics (Goals)" },
        { keys: ["F"], desc: "Go to Fitness & Workouts" },
        { keys: ["J"], desc: "Go to Secret Diary" },
        { keys: ["P"], desc: "Go to Kitty Piggy Bank" },
        { keys: ["C"], desc: "Go to Unified Calendar" },
        { keys: ["A"], desc: "Go to AI Priorities" },
        { keys: ["Y"], desc: "Go to Analytics & Stats" },
      ],
    },
    {
      title: "Rapid Creation Actions",
      subtitle: "Press when not typing in text inputs",
      items: [
        { keys: ["N"], desc: "Switch to Tasks & open creation form" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        id="shortcuts-backdrop"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      {/* Dialog container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        id="shortcuts-modal-card"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2 text-teal-400">
            <Keyboard className="h-5 w-5" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Keyboard Power Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            id="close-shortcuts-btn"
            className="rounded-lg hover:bg-slate-900 p-1.5 text-slate-500 hover:text-white transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content list */}
        <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-2" id={`shortcuts-section-${sIdx}`}>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-teal-500 tracking-wide uppercase">{sec.title}</span>
                {sec.subtitle && (
                  <span className="text-[10px] text-slate-550 italic font-mono">{sec.subtitle}</span>
                )}
              </div>

              <div className="grid gap-2 border border-slate-900/60 rounded-2xl bg-slate-900/10 p-3">
                {sec.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center justify-between py-1.5 text-xs border-b border-slate-900 last:border-b-0"
                  >
                    <span className="text-slate-300 font-medium">{item.desc}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <span key={kIdx} className="flex items-center gap-1">
                          {kIdx > 0 && <span className="text-slate-600 font-bold text-[10px]">+</span>}
                          <kbd className="inline-flex min-w-6 h-6 items-center justify-center px-1.5 py-0.5 rounded-md border border-slate-700 bg-slate-900 text-[10px] font-black font-mono text-teal-300 shadow-sm leading-none">
                            {k}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick footer */}
        <div className="mt-5 border-t border-slate-900 pt-3 text-center">
          <p className="text-[10px] font-mono text-slate-600 leading-normal">
            *Press <kbd className="bg-slate-900 border border-slate-800 text-slate-400 font-semibold px-1 py-0.5 rounded">Esc</kbd> anytime to dismiss active overlays. Happy productivity! 🐾
          </p>
        </div>
      </motion.div>
    </div>
  );
}
