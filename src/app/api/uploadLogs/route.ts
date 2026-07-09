import { NextResponse } from "next/server";
import { getUploadLogs } from "@/lib/dataDb";

export async function GET() {
  try {
    const logs = await getUploadLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to fetch upload logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
