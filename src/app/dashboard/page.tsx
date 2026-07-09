"use client";

import { useState, useEffect } from "react";
import { Download, LayoutDashboard, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Hotel, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

type SummaryData = {
  id: number;
  hotelName: string;
  actualSales: number;
  dailyTarget: number;
  gap: number;
  status: string;
};

type ReservationData = {
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
};

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [reservationsData, setReservationsData] = useState<ReservationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Auth Check
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth !== "true") {
      router.push("/login");
      return;
    }

    fetch("/api/data")
      .then(res => res.json())
      .then(data => {
        setSummaryData(data.summary);
        setReservationsData(data.reservations);
      })
      .catch(err => console.error("Error fetching data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    try {
      // Re-map keys to match the exact requested Excel columns
      const dataForExport = reservationsData.map(item => ({
        "Property name": item.propertyName,
        "Location": item.location,
        "Booker name": item.bookerName,
        "Genius booker": item.geniusBooker,
        "Arrival": item.arrival,
        "Departure": item.departure,
        "Booked on": item.bookedOn,
        "Status": item.status,
        "Total payment": item.totalPayment,
        "Commission": item.commission,
        "Currency": item.currency,
        "Reservation number": item.reservationNumber
      }));

      const ws = XLSX.utils.json_to_sheet(dataForExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reservations");

      // Generate filename based on date (hardcoded to match sample for now)
      const fileName = `Reservations_2026-07-08_2026-07-09.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data.");
    } finally {
      setTimeout(() => setIsExporting(false), 500); // Visual feedback
    }
  };

  const totalSales = summaryData.reduce((acc, curr) => acc + curr.actualSales, 0);
  const totalTarget = summaryData.reduce((acc, curr) => acc + curr.dailyTarget, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <LayoutDashboard className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Executive Dashboard</h1>
            </div>
            <p className="text-slate-400 text-sm ml-1">Daily Pickup Target Overview & Reporting</p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg border ${
              isExporting 
                ? "bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 hover:shadow-indigo-500/25 text-white hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            <Download className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`} />
            {isExporting ? "Exporting..." : "Export Reservations (.xlsx)"}
          </button>
        </header>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <TrendingUp className="w-24 h-24 text-green-400" />
            </div>
            <p className="text-slate-400 font-medium mb-1">Total Actual Sales</p>
            <h2 className="text-4xl font-bold text-white mb-2">฿{totalSales.toLocaleString()}</h2>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>Current day performance</span>
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Hotel className="w-24 h-24 text-blue-400" />
            </div>
            <p className="text-slate-400 font-medium mb-1">Total Daily Target</p>
            <h2 className="text-4xl font-bold text-white mb-2">฿{totalTarget.toLocaleString()}</h2>
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <CheckCircle className="w-4 h-4" />
              <span>Combined goal for 180 Days tracking</span>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown className="w-24 h-24 text-red-400" />
            </div>
            <p className="text-slate-400 font-medium mb-1">Total Shortfall (ยอดที่ขาดทั้งหมด)</p>
            <h2 className={`text-4xl font-bold mb-2 ${totalTarget - totalSales > 0 ? "text-red-400" : "text-green-400"}`}>
              ฿{Math.max(0, totalTarget - totalSales).toLocaleString()}
            </h2>
            <div className={`flex items-center gap-2 text-sm ${totalTarget - totalSales > 0 ? "text-red-400" : "text-green-400"}`}>
              {totalTarget - totalSales > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span>{totalTarget - totalSales > 0 ? "Remaining to reach goal" : "Goal exceeded!"}</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <section className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              Branch Performance Summary
            </h3>
            <span className="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-slate-300 border border-white/10">
              Date: 5/7/26
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-slate-400 text-sm border-b border-white/10">
                  <th className="px-6 py-4 font-medium whitespace-nowrap">ลำดับ (No.)</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">ชื่อสาขา (Hotel Name)</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-right">ยอดขายจริง (THB)</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-right">เป้าต่อวัน (THB)</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">ความคืบหน้า (Progress)</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-right">ส่วนต่าง (Gap)</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">สถานะ (Action Required)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {summaryData.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-400">{row.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{row.hotelName}</td>
                    <td className="px-6 py-4 text-right tabular-nums">฿{row.actualSales.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-slate-400">฿{row.dailyTarget.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="w-full min-w-[120px] bg-white/5 rounded-full h-2.5 mb-1 border border-white/10 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${row.actualSales >= row.dailyTarget ? 'bg-green-500' : 'bg-red-500'}`} 
                          style={{ width: `${Math.min(100, (row.actualSales / row.dailyTarget) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400">{Math.round((row.actualSales / row.dailyTarget) * 100)}% of target</span>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums">
                      <span className={`inline-flex items-center gap-1 font-medium ${row.gap >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {row.gap >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        ฿{Math.abs(row.gap).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        row.status.includes("High Priority") 
                          ? "bg-red-500/10 text-red-400 border-red-500/20" 
                          : "bg-green-500/10 text-green-400 border-green-500/20"
                      }`}>
                        {row.status.includes("High Priority") ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
