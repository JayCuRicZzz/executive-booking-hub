"use client";

import { useState, useEffect } from "react";
import { Database, Search, Loader2 } from "lucide-react";

type ReservationRecord = {
  id: string;
  propertyName: string;
  location: string;
  bookerName: string;
  geniusBooker: string;
  arrival: string;
  departure: string;
  bookedOn: string;
  status: string;
  totalPayment: number;
  commission: number;
  currency: string;
  reservationNumber: string;
  uploadedAt: string;
  uploadedBy: string;
};

export default function ReservationsPage() {
  const [data, setData] = useState<ReservationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/data")
      .then(res => res.json())
      .then(result => {
        setData(result.reservations || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const filteredData = data.filter(item => {
    const matchesSearch = item.bookerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reservationNumber.includes(searchQuery) ||
      item.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = branchFilter === "ALL" || item.propertyName === branchFilter;
    
    return matchesSearch && matchesBranch;
  });

  const uniqueBranches = Array.from(new Set(data.map(item => item.propertyName))).sort();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <Database className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">All Data (Master)</h1>
            </div>
            <p className="text-slate-400 text-sm ml-1">ฐานข้อมูลการจองทั้งหมดที่ถูกอัปโหลดเข้าระบบ</p>
          </div>

          <div className="relative w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full sm:w-48 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">ทุกสาขา (All Branches)</option>
              {uniqueBranches.map(branch => (
                <option key={branch} value={branch} className="bg-slate-900">{branch}</option>
              ))}
            </select>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้จอง, รหัส..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </header>

        <section className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-white/[0.01]">
            <p className="text-sm text-slate-400">พบข้อมูลทั้งหมด <span className="text-white font-medium">{filteredData.length}</span> รายการ</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-slate-400 text-xs border-b border-white/10">
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Res. No.</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Booker Name</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Property</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Arrival</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap text-right">Payment</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Uploaded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      ไม่พบข้อมูล (No data found)
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors text-sm">
                      <td className="px-4 py-3 font-mono text-slate-300">{row.reservationNumber}</td>
                      <td className="px-4 py-3 text-white font-medium">{row.bookerName}</td>
                      <td className="px-4 py-3 text-slate-300">{row.propertyName}</td>
                      <td className="px-4 py-3 text-slate-400">{row.arrival}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-200">
                        {row.totalPayment.toLocaleString()} {row.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.status.toLowerCase().includes("cancel") 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                            : "bg-green-500/10 text-green-400 border border-green-500/20"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {row.uploadedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
