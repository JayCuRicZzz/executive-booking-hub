import { NextResponse } from "next/server";
import { getReservations, getTargets } from "@/lib/dataDb";
import { BRANCH_TARGETS as DEFAULT_BRANCH_TARGETS, getDaysInMonth } from "@/lib/targetsData";

export async function GET() {
  try {
    const [reservations, dbTargets] = await Promise.all([
      getReservations(),
      getTargets()
    ]);
    
    const now = new Date();
    const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const year = thailandTime.getUTCFullYear();
    
    // Map dbTargets to the old format, fallback to default if empty
    let activeTargets = DEFAULT_BRANCH_TARGETS;
    
    const currentYearTargets = dbTargets.filter(t => t.year === year);
    if (currentYearTargets.length > 0) {
      activeTargets = currentYearTargets.map(t => ({
        propertyName: t.propertyName,
        targets: {
          [`${year}-01`]: t.jan,
          [`${year}-02`]: t.feb,
          [`${year}-03`]: t.mar,
          [`${year}-04`]: t.apr,
          [`${year}-05`]: t.may,
          [`${year}-06`]: t.jun,
          [`${year}-07`]: t.jul,
          [`${year}-08`]: t.aug,
          [`${year}-09`]: t.sep,
          [`${year}-10`]: t.oct,
          [`${year}-11`]: t.nov,
          [`${year}-12`]: t.dec,
        }
      })) as any;
    } else {
      // If db targets is empty, save the default ones to DB so they exist next time
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/targets`, {
         method: 'GET'
      }).catch(e => console.error("Could not init targets", e));
    }
    // Compute summary
    const month = thailandTime.getUTCMonth() + 1;
    // Type assertion to any since the keys might not match exactly the old type if dynamic
    const currentMonthKey = `${year}-${month.toString().padStart(2, '0')}` as any;
    const daysInMonth = getDaysInMonth(year, month);

    const summary = activeTargets.map((branch, index) => {
      const monthTarget = (branch.targets as any)[currentMonthKey] || 0;
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
