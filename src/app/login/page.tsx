"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogIn, Lock } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store user info in localStorage for UI purposes (optional, since token is in cookie)
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("username", data.user.username);
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid username or password");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Building2 className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm text-center">
            Sign in to access the Executive Dashboard and Upload System.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg ${
              isLoading 
                ? "bg-indigo-600/50 text-indigo-200 cursor-wait" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white hover:-translate-y-0.5 hover:shadow-indigo-500/25 active:translate-y-0"
            }`}
          >
            {isLoading ? (
              <Lock className="w-5 h-5 animate-pulse" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-1">
          <p className="text-sm font-medium text-slate-300 flex items-center justify-center gap-2">
            👨‍💻 พัฒนาโดย: นายเดชาธร เดชอนุรักษ์
          </p>
          <p className="text-xs text-slate-400">
            ✨ JayCuRicZzz | 📱 0944926155
          </p>
        </div>
      </div>
    </div>
  );
}
