import { NextResponse } from "next/server";
import { getReservations } from "@/lib/dataDb";

import { BRANCH_TARGETS, getDaysInMonth } from "@/lib/targetsData";

export async function GET() {
  try {
    const reservations = await getReservations();

    // Compute summary
    const now = new Date();
    const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const year = thailandTime.getUTCFullYear();
    const month = thailandTime.getUTCMonth() + 1;
    const currentMonthKey = `${year}-${month.toString().padStart(2, '0')}` as keyof typeof BRANCH_TARGETS[0]['targets'];
    const daysInMonth = getDaysInMonth(year, month);

    const summary = BRANCH_TARGETS.map((branch, index) => {
      const monthTarget = branch.targets[currentMonthKey] || 0;
      const dailyTarget = monthTarget / daysInMonth;

      // Find all reservations for this branch
      const branchReservations = reservations.filter(r => 
        r.propertyName.toLowerCase().includes(branch.propertyName.toLowerCase()) || 
        branch.propertyName.toLowerCase().includes(r.propertyName.toLowerCase())
      );

      const totalBookings = branchReservations.length;
      const actualSales = branchReservations.reduce((sum, r) => sum + (r.totalPayment || 0), 0);
      const totalCommission = branchReservations.reduce((sum, r) => sum + (r.commission || 0), 0);
      const netRevenue = actualSales - totalCommission;

      const gap = actualSales - dailyTarget;
      let status = "";
      if (gap >= 0) {
        status = "🟢 On Track - ทำได้ตามเป้า";
      } else {
        status = "🔴 High Priority - ต้องเร่งอัดแคมเปญด่วน";
      }

      return {
        id: index + 1,
        hotelName: branch.propertyName,
        totalBookings,
        actualSales,
        totalCommission,
        netRevenue,
        dailyTarget,
        gap,
        status
      };
    });

    return NextResponse.json({
      summary,
      reservations,
      source: "google-sheets"
    });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
