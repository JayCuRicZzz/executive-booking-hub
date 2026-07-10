"use client";

import { useState, useEffect } from "react";
import { Download, LayoutDashboard, TrendingUp, TrendingDown, CheckCircle, AlertCircle, Hotel, Loader2, Target, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

type SummaryData = {
  id: number;
  hotelName: string;
  totalBookings: number;
  actualSales: number;
  totalCommission: number;
  netRevenue: number;
  dailyTarget: number;
  monthlyTarget: number;
  yearlyTarget: number;
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

  const formatMoney = (val: number) => 
    new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  useEffect(() => {
    // Auth is handled by Next.js Middleware. Safe to fetch.

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
  const totalCommission = summaryData.reduce((acc, curr) => acc + curr.totalCommission, 0);
  const totalNetRevenue = summaryData.reduce((acc, curr) => acc + curr.netRevenue, 0);
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

        </header>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-20 h-20 text-indigo-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">ยอดขายทำได้จริง (Gross)</p>
            <h2 className="text-3xl font-bold text-white mb-2">฿{formatMoney(totalSales)}</h2>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Current gross sales</span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle className="w-20 h-20 text-rose-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">หักคอมมิชชั่น (Commission)</p>
            <h2 className="text-3xl font-bold text-rose-400 mb-2">-฿{formatMoney(totalCommission)}</h2>
            <div className="flex items-center gap-1.5 text-xs text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Deducted from gross</span>
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/10 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-20 h-20 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">เป้าหมายรวม (Daily Target)</p>
            <h2 className="text-3xl font-bold text-white mb-2">฿{formatMoney(totalTarget)}</h2>
            <div className="flex items-center gap-1.5 text-xs text-blue-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Combined goal for tracking</span>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle className="w-20 h-20 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">รายได้สุทธิ (Net Revenue)</p>
            <h2 className="text-3xl font-bold text-emerald-400 mb-2">
              ฿{formatMoney(totalNetRevenue)}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Gross minus commission</span>
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
                  <th className="px-4 md:px-6 py-4 font-medium whitespace-nowrap">ลำดับ</th>
                  <th className="px-4 md:px-6 py-4 font-medium whitespace-nowrap">ชื่อสาขา (Hotel Name)</th>
                  <th className="px-4 md:px-6 py-4 font-medium whitespace-nowrap text-right">ยอดขายจริง (THB)</th>
                  <th className="hidden md:table-cell px-6 py-4 font-medium whitespace-nowrap text-right">เป้าเดือน (THB)</th>
                  <th className="hidden lg:table-cell px-6 py-4 font-medium whitespace-nowrap text-right">เป้าปี (THB)</th>
                  <th className="px-4 md:px-6 py-4 font-medium whitespace-nowrap">ความคืบหน้า (Progress)</th>
                  <th className="px-4 md:px-6 py-4 font-medium whitespace-nowrap text-right">ส่วนต่าง (Gap)</th>
                  <th className="hidden md:table-cell px-6 py-4 font-medium whitespace-nowrap">สถานะ (Action Required)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm md:text-base">
                {summaryData.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 md:px-6 py-4 text-slate-400">{row.id}</td>
                    <td className="px-4 md:px-6 py-4 font-medium text-white">{row.hotelName}</td>
                    <td className="px-4 md:px-6 py-4 text-right tabular-nums text-indigo-300">
                      <div className="flex flex-col items-end">
                        <span className="font-bold">฿{formatMoney(row.actualSales)}</span>
                        <span className="text-xs text-slate-400 md:hidden">เป้าด.: ฿{formatMoney(row.monthlyTarget)}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-right tabular-nums text-slate-400">฿{formatMoney(row.monthlyTarget)}</td>
                    <td className="hidden lg:table-cell px-6 py-4 text-right tabular-nums text-slate-400">฿{formatMoney(row.yearlyTarget)}</td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="w-full min-w-[80px] md:min-w-[120px] bg-white/5 rounded-full h-2.5 mb-1 border border-white/10 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${row.actualSales >= row.monthlyTarget ? 'bg-green-500' : 'bg-red-500'}`} 
                          style={{ width: `${Math.min(100, (row.actualSales / (row.monthlyTarget || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400">{Math.round((row.actualSales / (row.monthlyTarget || 1)) * 100)}% (เดือน)</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right tabular-nums">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${row.gap >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                          {row.gap >= 0 ? <TrendingUp className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          <span className="font-bold whitespace-nowrap">
                            {row.gap >= 0 ? 'เกินเป้า ' : 'ขาดอีก '}
                            ฿{formatMoney(Math.abs(row.gap))}
                          </span>
                        </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        row.status.includes("High Priority") 
                          ? "bg-red-500/10 text-red-400 border-red-500/20" 
                          : "bg-green-500/10 text-green-400 border-green-500/20"
                      }`}>
                        {row.status.includes("High Priority") ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        <span className="max-w-[120px] truncate" title={row.status}>{row.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Net Revenue Analysis Table */}
        <section className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl mt-12">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              Net Revenue Analysis (วิเคราะห์รายได้สุทธิ)
            </h3>
            <span className="text-xs font-medium px-3 py-1 bg-white/5 rounded-full text-slate-300 border border-white/10">
              รวมทุกรายการ
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-slate-400 text-sm border-b border-white/10">
                  <th className="px-4 md:px-6 py-4 font-medium whitespace-nowrap">ชื่อสาขา (Hotel Name)</th>
                  <th className="px-4 md:px-6 py-4 font-medium whitespace-nowrap text-right">ยอดขายรวม (Gross)</th>
                  <th className="px-4 md:px-6 py-4 font-medium whitespace-nowrap text-right text-rose-300">หักคอมมิชชั่น</th>
                  <th className="px-4 md:px-6 py-4 font-medium whitespace-nowrap text-right text-emerald-300">รายได้สุทธิ (Net)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm md:text-base">
                {summaryData.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 md:px-6 py-4 font-medium text-white">{row.hotelName}</td>
                    <td className="px-4 md:px-6 py-4 text-right tabular-nums text-slate-300">฿{formatMoney(row.actualSales)}</td>
                    <td className="px-4 md:px-6 py-4 text-right tabular-nums text-rose-400">-฿{formatMoney(row.totalCommission)}</td>
                    <td className="px-4 md:px-6 py-4 text-right tabular-nums font-bold text-emerald-400">฿{formatMoney(row.netRevenue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white/[0.05] border-t-2 border-white/20">
                <tr>
                  <td className="px-4 md:px-6 py-4 font-bold text-white text-right">ยอดรวมทุกสาขา</td>
                  <td className="px-4 md:px-6 py-4 text-right tabular-nums font-bold text-slate-200">
                    ฿{formatMoney(summaryData.reduce((acc, curr) => acc + curr.actualSales, 0))}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right tabular-nums font-bold text-rose-400">
                    -฿{formatMoney(summaryData.reduce((acc, curr) => acc + curr.totalCommission, 0))}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right tabular-nums font-bold text-emerald-400 text-lg">
                    ฿{formatMoney(summaryData.reduce((acc, curr) => acc + curr.netRevenue, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
