import { NextResponse } from "next/server";
import { getTargets, saveTargets, TargetRecord } from "@/lib/dataDb";
import { BRANCH_TARGETS } from "@/lib/targetsData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get('year');
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

    const targets = await getTargets();
    let yearTargets = targets.filter(t => t.year === year);

    // If no targets found for this year, populate with defaults from targetsData (if 2026) or empty
    if (yearTargets.length === 0) {
      if (year === 2026) {
        yearTargets = BRANCH_TARGETS.map(b => {
          return {
            propertyName: b.propertyName,
            year: 2026,
            jan: b.targets["2026-01"] || 0,
            feb: b.targets["2026-02"] || 0,
            mar: b.targets["2026-03"] || 0,
            apr: b.targets["2026-04"] || 0,
            may: b.targets["2026-05"] || 0,
            jun: b.targets["2026-06"] || 0,
            jul: b.targets["2026-07"] || 0,
            aug: b.targets["2026-08"] || 0,
            sep: b.targets["2026-09"] || 0,
            oct: b.targets["2026-10"] || 0,
            nov: b.targets["2026-11"] || 0,
            dec: b.targets["2026-12"] || 0,
          };
        });
      } else {
        yearTargets = BRANCH_TARGETS.map(b => ({
            propertyName: b.propertyName,
            year: year,
            jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
        }));
      }
    }

    return NextResponse.json({ targets: yearTargets }, { status: 200 });
  } catch (error) {
    console.error("GET targets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { targets, year } = data;

    if (!targets || !Array.isArray(targets)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Since we clear and write all targets in saveTargets for simplicity, we need to fetch existing targets for OTHER years
    const allExistingTargets = await getTargets();
    
    // Remove old targets for this specific year
    const otherYearsTargets = allExistingTargets.filter(t => t.year !== year);
    
    // Combine
    const finalTargetsToSave = [...otherYearsTargets, ...targets];

    const success = await saveTargets(finalTargetsToSave);

    if (success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Failed to save to Google Sheets" }, { status: 500 });
    }
  } catch (error) {
    console.error("POST targets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
