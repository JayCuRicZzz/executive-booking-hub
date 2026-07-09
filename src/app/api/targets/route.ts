import { NextResponse } from "next/server";
import { getReservations } from "@/lib/dataDb";
import { BRANCH_TARGETS, getDaysInMonth } from "@/lib/targetsData";

export async function GET() {
  try {
    const reservations = await getReservations();
    
    // Calculate current time periods
    const now = new Date();
    // Use Thailand time (UTC+7) for consistency with local business operations
    const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    
    const year = thailandTime.getUTCFullYear();
    const month = thailandTime.getUTCMonth() + 1; // 1-12
    const date = thailandTime.getUTCDate();
    const dayOfWeek = thailandTime.getUTCDay() === 0 ? 7 : thailandTime.getUTCDay(); // 1=Mon, 7=Sun
    
    const currentMonthKey = `${year}-${month.toString().padStart(2, '0')}` as keyof typeof BRANCH_TARGETS[0]['targets'];
    const daysInMonth = getDaysInMonth(year, month);
    
    // Date strings for matching
    const todayStr = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    const startOfWeekDate = new Date(thailandTime);
    startOfWeekDate.setUTCDate(date - dayOfWeek + 1);
    
    // We'll compute the rankings
    const rankings = BRANCH_TARGETS.map(branchConfig => {
      // Get the monthly target
      const monthTarget = branchConfig.targets[currentMonthKey] || 0;
      const dailyTarget = monthTarget / daysInMonth;
      const weeklyTarget = dailyTarget * 7;
      
      // Calculate Yearly Target
      const yearlyTarget = Object.values(branchConfig.targets).reduce((sum, val) => sum + val, 0);
      
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
        const rDate = new Date(r.uploadedAt);
        const rThai = new Date(rDate.getTime() + (7 * 60 * 60 * 1000));
        
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
      rankings
    });
    
  } catch (error) {
    console.error("Failed to fetch targets:", error);
    return NextResponse.json({ error: "Failed to fetch targets" }, { status: 500 });
  }
}
