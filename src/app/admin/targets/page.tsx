"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, Target, CalendarDays, Plus } from "lucide-react";
import { TargetRecord } from "@/lib/dataDb";

export default function AdminTargetsPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [targets, setTargets] = useState<TargetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchTargets(year);
  }, [year]);

  const fetchTargets = async (selectedYear: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/targets?year=${selectedYear}`);
      const data = await res.json();
      if (data.targets) {
        setTargets(data.targets);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTargetChange = (index: number, field: keyof TargetRecord, value: string) => {
    const newTargets = [...targets];
    if (field === 'propertyName') {
      newTargets[index] = { ...newTargets[index], [field]: value };
    } else {
      newTargets[index] = { ...newTargets[index], [field]: parseFloat(value) || 0 };
    }
    setTargets(newTargets);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets, year })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "บันทึกเป้าหมายสำเร็จแล้ว!", type: "success" });
      } else {
        setMessage({ text: "เกิดข้อผิดพลาดในการบันทึก", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: "เกิดข้อผิดพลาดการเชื่อมต่อ", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const addBranch = () => {
    setTargets([
      ...targets, 
      { propertyName: "New Branch", year, jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">จัดการเป้าหมาย (Targets)</h1>
            </div>
            <p className="text-slate-400 text-sm ml-1">ตั้งค่าเป้าหมายรายเดือนของแต่ละสาขาสำหรับปี {year}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <select 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
              >
                {[2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y} className="bg-slate-900">{y}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all shadow-lg border ${
                isSaving 
                  ? "bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 hover:shadow-indigo-500/25 text-white"
              }`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Targets"}
            </button>
          </div>
        </header>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            {message.text}
          </div>
        )}

        <section className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-slate-400 text-sm border-b border-white/10">
                    <th className="px-4 py-4 font-medium whitespace-nowrap sticky left-0 bg-slate-950 z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">Hotel Name</th>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                      <th key={m} className="px-4 py-4 font-medium whitespace-nowrap text-right">{m}</th>
                    ))}
                    <th className="px-4 py-4 font-medium whitespace-nowrap text-right text-indigo-400">Total Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {targets.map((row, index) => {
                    const yearlyTotal = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].reduce((sum, month) => sum + (row[month as keyof TargetRecord] as number), 0);
                    return (
                      <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 sticky left-0 bg-slate-950 z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                          <input 
                            type="text" 
                            value={row.propertyName}
                            onChange={(e) => handleTargetChange(index, 'propertyName', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map(month => (
                          <td key={month} className="px-4 py-3">
                            <input 
                              type="number" 
                              value={row[month as keyof TargetRecord] === 0 ? '' : row[month as keyof TargetRecord] as number}
                              onChange={(e) => handleTargetChange(index, month as keyof TargetRecord, e.target.value)}
                              placeholder="0"
                              className="w-24 text-right bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right font-medium text-indigo-400 tabular-nums">
                          {new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(yearlyTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-4 border-t border-white/10 bg-white/[0.01]">
             <button 
               onClick={addBranch}
               className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
             >
               <Plus className="w-4 h-4" />
               เพิ่มสาขาใหม่ (Add New Branch)
             </button>
          </div>
        </section>
      </main>
    </div>
  );
}
