import { NextResponse } from "next/server";
import { getReservations } from "@/lib/dataDb";

// We hardcode the targets for now since there's no target database yet.
const BRANCH_TARGETS = [
  { id: 1, hotelName: "Grand Bella", dailyTarget: 50000 },
  { id: 2, hotelName: "Bella Villa Cabana", dailyTarget: 20000 },
  { id: 3, hotelName: "Bella Express", dailyTarget: 25000 },
  { id: 4, hotelName: "Bella Villa Prima", dailyTarget: 30000 },
  { id: 5, hotelName: "Best Bella Pattaya", dailyTarget: 25000 },
  { id: 6, hotelName: "Bella Villa Metro", dailyTarget: 15000 },
  { id: 7, hotelName: "Sawasdee Place", dailyTarget: 15000 },
  { id: 8, hotelName: "Bella Villa Pattaya 3rd Road", dailyTarget: 20000 },
  { id: 9, hotelName: "Central Pattaya Hostel", dailyTarget: 10000 }
];

export async function GET() {
  try {
    const reservations = await getReservations();

    // Compute summary
    const summary = BRANCH_TARGETS.map(branch => {
      // Find all reservations for this branch
      // Sometimes property names in Excel differ slightly, so we should do a flexible match or exact match.
      const branchReservations = reservations.filter(r => 
        r.propertyName.toLowerCase().includes(branch.hotelName.toLowerCase()) || 
        branch.hotelName.toLowerCase().includes(r.propertyName.toLowerCase())
      );

      const actualSales = branchReservations.reduce((sum, r) => sum + (r.totalPayment || 0), 0);
      const gap = actualSales - branch.dailyTarget;
      let status = "";
      if (gap >= 0) {
        status = "🟢 On Track - ทำได้ตามเป้า";
      } else {
        status = "🔴 High Priority - ต้องเร่งอัดแคมเปญด่วน";
      }

      return {
        id: branch.id,
        hotelName: branch.hotelName,
        actualSales,
        dailyTarget: branch.dailyTarget,
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
