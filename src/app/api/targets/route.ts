import { NextResponse } from "next/server";
import { getReservations, getTargets, getUploadLogs } from "@/lib/dataDb";
import { BRANCH_TARGETS as DEFAULT_BRANCH_TARGETS, getDaysInMonth } from "@/lib/targetsData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const [reservations, dbTargets, uploadLogs] = await Promise.all([
      getReservations(),
      getTargets(),
      getUploadLogs()
    ]);
    
    const lastUpdated = uploadLogs.length > 0 ? uploadLogs[0].uploadDate : null;
    
    // Calculate current time periods
    const now = dateParam ? new Date(dateParam) : new Date();
    // Use Thailand time (UTC+7) for consistency with local business operations if using current time
    // If dateParam is provided (YYYY-MM-DD), the date is already exact, but we can still apply the +7 offset to safely parse it as local.
    const thailandTime = dateParam ? new Date(dateParam) : new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
    const year = thailandTime.getUTCFullYear();
    const month = thailandTime.getUTCMonth() + 1; // 1-12
    const date = thailandTime.getUTCDate();
    const dayOfWeek = thailandTime.getUTCDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
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
    }
    
    const startOfWeekDate = new Date(thailandTime);
    startOfWeekDate.setUTCDate(date + diffToMonday);
    startOfWeekDate.setUTCHours(0, 0, 0, 0);
    
    const currentMonthKey = `${year}-${month.toString().padStart(2, '0')}` as any;
    const daysInMonth = getDaysInMonth(year, month);
    
    // We'll compute the rankings
    const rankings = activeTargets.map(branchConfig => {
      // Get the monthly target
      const monthTarget = (branchConfig.targets as any)[currentMonthKey] || 0;
      const dailyTarget = monthTarget / daysInMonth;
      const weeklyTarget = dailyTarget * 7;
      
      // Calculate Yearly Target
      const yearlyTarget = Object.values(branchConfig.targets).reduce((sum: any, val: any) => sum + val, 0);
      
      // Filter reservations for this branch
      const branchReservations = reservations.filter(r => 
        r.propertyName.toLowerCase().includes(branchConfig.propertyName.toLowerCase()) || 
        branchConfig.propertyName.toLowerCase().includes(r.propertyName.toLowerCase())
      );
      
      let todayActual = 0;
      let weekActual = 0;
      let monthActual = 0;
      let yearActual = 0;
      
      branchReservations.forEach(r => {
        // Use bookedOn if available, fallback to arrival, then uploadedAt
        const dateStr = r.bookedOn || r.arrival || r.uploadedAt;
        const rDate = new Date(dateStr);
        // We assume bookedOn (YYYY-MM-DD) parses cleanly in UTC, but if it has time we can adjust
        const rThai = new Date(rDate.getTime()); 
        
        const rYear = rThai.getUTCFullYear();
        const rMonth = rThai.getUTCMonth() + 1;
        const rDay = rThai.getUTCDate();
        
        const isSameYear = rYear === year;
        const isSameMonth = isSameYear && rMonth === month;
        const isSameDay = isSameMonth && rDay === date;
        const isSameWeek = rThai >= startOfWeekDate && rThai <= thailandTime;
        
        const amount = r.totalPayment || 0;
        
        if (isSameYear) yearActual += amount;
        if (isSameMonth) monthActual += amount;
        if (isSameWeek) weekActual += amount;
        if (isSameDay) todayActual += amount;
      });
      
      return {
        propertyName: branchConfig.propertyName,
        today: {
          target: dailyTarget,
          actual: todayActual,
          gap: todayActual - dailyTarget,
          percent: dailyTarget > 0 ? (todayActual / dailyTarget) * 100 : 0
        },
        week: {
          target: weeklyTarget,
          actual: weekActual,
          gap: weekActual - weeklyTarget,
          percent: weeklyTarget > 0 ? (weekActual / weeklyTarget) * 100 : 0
        },
        month: {
          target: monthTarget,
          actual: monthActual,
          gap: monthActual - monthTarget,
          percent: monthTarget > 0 ? (monthActual / monthTarget) * 100 : 0
        },
        year: {
          target: yearlyTarget,
          actual: yearActual,
          gap: yearActual - yearlyTarget,
          percent: yearlyTarget > 0 ? (yearActual / yearlyTarget) * 100 : 0
        }
      };
    });
    
    return NextResponse.json({
      currentMonth: currentMonthKey,
      lastUpdated,
      rankings
    });
    
  } catch (error) {
    console.error("Failed to fetch targets:", error);
    return NextResponse.json({ error: "Failed to fetch targets" }, { status: 500 });
  }
}
