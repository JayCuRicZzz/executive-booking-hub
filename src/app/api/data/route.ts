import { NextResponse } from "next/server";
import { mockSummaryData, mockReservationsData } from "@/lib/mockData";

export async function GET() {
  try {
    // TODO: Implement Google Sheets API
    // 1. Authenticate with Service Account using googleapis
    // const auth = new google.auth.GoogleAuth({
    //   credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
    //   scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    // });
    // 2. Fetch data from sheets
    // const sheets = google.sheets({ version: 'v4', auth });
    // const response = await sheets.spreadsheets.values.get({ ... })

    // Currently falling back to MOCK DATA since credentials are not provided yet.
    return NextResponse.json({
      summary: mockSummaryData,
      reservations: mockReservationsData,
      source: "mock"
    });
  } catch (error) {
    console.error("Failed to fetch data from Google Sheets:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
