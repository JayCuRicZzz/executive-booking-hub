"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp, AlertTriangle, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";

type RankingData = {
  propertyName: string;
  today: { target: number; actual: number; gap: number; percent: number };
  week: { target: number; actual: number; gap: number; percent: number };
  month: { target: number; actual: number; gap: number; percent: number };
  year: { target: number; actual: number; gap: number; percent: number };
};

type ViewMode = "today" | "week" | "month" | "year";

export default function TargetsPage() {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  useEffect(() => {
    fetch("/api/targets")
      .then(res => res.json())
      .then(data => {
        setRankings(data.rankings || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Sort by gap (lowest to highest, so negative gaps (missing targets) are at the top, or by percent)
  // Let's sort by percent achieved (highest to lowest) to rank them, or maybe the ones missing most are at top?
  // Usually, a leaderboard ranks the BEST at the top. We will highlight the bad ones in red.
  const sortedRankings = [...rankings].sort((a, b) => b[viewMode].percent - a[viewMode].percent);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const formatMoney = (val: number) => 
    new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[40%] w-[60%] h-[60%] bg-rose-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <Target className="w-6 h-6 text-rose-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Target Ranking</h1>
            </div>
            <p className="text-slate-400 text-sm ml-1">
              จัดอันดับสาขาตามเป้าหมาย (เป้าหมายหลัก: 100 ล้านบาท)
            </p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-full border border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar">
            {(["today", "week", "month", "year"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-none px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  viewMode === mode 
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {mode === "today" ? "วันนี้" : mode === "week" ? "สัปดาห์นี้" : mode === "month" ? "เดือนนี้" : "ปีนี้"}
              </button>
            ))}
          </div>
        </header>

        <div className="space-y-4">
          {sortedRankings.map((branch, index) => {
            const data = branch[viewMode];
            const isMissing = data.gap < 0;
            
            return (
              <div 
                key={branch.propertyName}
                className={`relative overflow-hidden rounded-2xl border p-5 md:p-6 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                  isMissing 
                    ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10" 
                    : "bg-white/[0.02] border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.04]"
                }`}
              >
                {/* Ranking Number */}
                <div className="absolute top-0 left-0 bottom-0 w-2 flex flex-col">
                  <div className={`h-full w-full ${isMissing ? 'bg-red-500/50' : 'bg-green-500/50'}`} />
                </div>

                <div className="flex items-center gap-6 pl-4 flex-1 w-full">
                  <div className={`text-4xl font-black italic opacity-20 ${isMissing ? 'text-red-500' : 'text-slate-500'}`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{branch.propertyName}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400">
                        เป้า: <span className="font-semibold text-white">{formatMoney(data.target)}</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-slate-400">
                        ทำได้: <span className="font-semibold text-white">{formatMoney(data.actual)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 pl-4 md:pl-0 w-full md:w-auto">
                  {/* Gap Alert */}
                  <div className="flex flex-col items-start md:items-end flex-1 md:flex-none">
                    <p className="text-sm text-slate-400 mb-1">สถานะ (Gap)</p>
                    {isMissing ? (
                      <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-bold text-sm truncate">ขาดอีก {formatMoney(Math.abs(data.gap))}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/20">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold text-sm">เกินเป้า {formatMoney(data.gap)}</span>
                      </div>
                    )}
                  </div>

                  {/* Percentage Ring / Progress */}
                  <div className="flex items-center justify-center relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/10"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className={isMissing ? "text-red-500" : "text-green-500"}
                        strokeDasharray={`${Math.min(data.percent, 100)}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={`text-xs font-bold ${isMissing ? 'text-red-400' : 'text-green-400'}`}>
                        {Math.floor(data.percent)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
