import { NextResponse } from "next/server";
import { saveReservations, saveUploadLog, getReservations, ReservationRecord } from "@/lib/dataDb";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, records, uploadedBy } = body;

    if (!fileName || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // 1. Fetch existing records to check for duplicates
    const existingReservations = await getReservations();
    const existingResNumbers = new Set(existingReservations.map(r => r.reservationNumber));

    // 2. Filter new records
    const newRecordsToSave: Partial<ReservationRecord>[] = [];
    let duplicateCount = 0;

    const now = new Date().toISOString();

    for (const record of records) {
      const resNo = String(record["Reservation number"] || record["reservationNumber"] || "");
      if (!resNo) continue;

      if (existingResNumbers.has(resNo)) {
        duplicateCount++;
      } else {
        newRecordsToSave.push({
          id: uuidv4(),
          propertyName: record["Property name"] || record["propertyName"] || "",
          location: record["Location"] || record["location"] || "",
          bookerName: record["Booker name"] || record["bookerName"] || "",
          geniusBooker: record["Genius booker"] || record["geniusBooker"] || "",
          arrival: record["Arrival"] || record["arrival"] || "",
          departure: record["Departure"] || record["departure"] || "",
          bookedOn: record["Booked on"] || record["bookedOn"] || "",
          status: record["Status"] || record["status"] || "",
          totalPayment: parseFloat(record["Total payment"] || record["totalPayment"] || 0),
          commission: parseFloat(record["Commission"] || record["commission"] || 0),
          currency: record["Currency"] || record["currency"] || "",
          reservationNumber: resNo,
          uploadedAt: now,
          uploadedBy: uploadedBy || "Unknown",
          tag: ""
        });
        existingResNumbers.add(resNo); // prevent duplicates within the same upload batch
      }
    }

    // 3. Save new records
    if (newRecordsToSave.length > 0) {
      await saveReservations(newRecordsToSave);
    }

    // 4. Save upload log
    await saveUploadLog({
      id: uuidv4(),
      fileName: fileName,
      uploadDate: now,
      uploadedBy: uploadedBy || "Unknown",
      newRecords: newRecordsToSave.length,
      duplicates: duplicateCount
    });

    return NextResponse.json({
      success: true,
      newRecords: newRecordsToSave.length,
      duplicates: duplicateCount
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
