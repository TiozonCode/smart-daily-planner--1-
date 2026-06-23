import { useState, FormEvent } from "react";
import { Lock, Mail, User, ShieldCheck, ArrowRight, Loader2, RefreshCw, Cat } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import cutePlanningCat from "../assets/images/cute_planning_cat_1782193755882.jpg";

interface AuthPageProps {
  onAuthSuccess: (user: any, token: string) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const url = isForgotPassword
      ? "/api/auth/forgot-password"
      : isLogin
      ? "/api/auth/login"
      : "/api/auth/register";

    const bodyObj = isForgotPassword
      ? { email }
      : isLogin
      ? { email, password }
      : { email, password, name };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "An authentication error occurred.");
      }

      if (isForgotPassword) {
        setSuccessMsg(data.message || "Reset guidelines sent!");
        setEmail("");
        setIsForgotPassword(false);
        setIsLogin(true);
      } else {
        localStorage.setItem("planner_token", data.token);
        localStorage.setItem("planner_user", JSON.stringify(data.user));
        onAuthSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "janetiozon1@gmail.com", password: "password" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");
      
      localStorage.setItem("planner_token", data.token);
      localStorage.setItem("planner_user", JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || "Failed to start demo version.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
        {/* Top Branding Section */}
        <div className="mb-4 text-center text-slate-100 flex flex-col items-center">
          <div className="mx-auto mb-3 flex h-24 w-24 overflow-hidden rounded-3xl border-2 border-slate-800 bg-slate-950 shadow-lg shadow-teal-500/10">
            <img 
              src={cutePlanningCat} 
              alt="Cute Planning Cat" 
              className="h-full w-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-white">
            Cat Daily Planner 🐾
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Feline-Enhanced Personal Productivity Assistant
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isForgotPassword ? "forgot" : isLogin ? "login" : "register"}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400">
                  {successMsg}
                </div>
              )}

              {/* Name Field for Register */}
              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Shinderu"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pr-4 pl-10 text-sm placeholder-slate-600 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pr-4 pl-10 text-sm placeholder-slate-600 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              {!isForgotPassword && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError(null);
                        }}
                        className="text-xs text-teal-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pr-4 pl-10 text-sm placeholder-slate-600 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 py-3 font-sans text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/25 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isForgotPassword ? (
                  "Request Recovery Link"
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>

        {/* Form Toggle and Demo Options */}
        <div className="mt-6 space-y-4 text-center">
          {isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-xs text-teal-400 hover:underline"
            >
              Back to Login
            </button>
          ) : (
            <p className="text-xs text-slate-500">
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-medium text-teal-400 hover:underline"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="mx-3 text-[10px] uppercase tracking-widest text-slate-600">
              OR EXPLORE DEMO
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 hover:bg-slate-800/40 py-2.5 text-xs font-medium text-slate-300 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-teal-400" />
            Sign in as Guest (Shinderu)
          </button>
        </div>
      </div>
    </div>
  );
}
