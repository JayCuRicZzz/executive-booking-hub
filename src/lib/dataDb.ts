import { getGoogleSheet } from './googleSheets';

const RESERVATIONS_SHEET_TITLE = 'Reservations';
const UPLOAD_LOGS_SHEET_TITLE = 'UploadLogs';

export type ReservationRecord = {
  id: string;
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
  uploadedAt: string;
  uploadedBy: string;
  tag: string;
};

export type UploadLog = {
  id: string;
  fileName: string;
  uploadDate: string;
  uploadedBy: string;
  newRecords: number;
  duplicates: number;
};

async function getOrCreateSheet(doc: any, title: string, headers: string[]) {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({ headerValues: headers, title });
  } else {
    await sheet.setHeaderRow(headers);
  }
  return sheet;
}

export async function getReservations(): Promise<ReservationRecord[]> {
  try {
    const doc = await getGoogleSheet();
    if (!doc) throw new Error("Failed to connect to Google Sheets");

    const sheet = await getOrCreateSheet(doc, RESERVATIONS_SHEET_TITLE, [
      'id', 'propertyName', 'location', 'bookerName', 'geniusBooker', 
      'arrival', 'departure', 'bookedOn', 'status', 'totalPayment', 
      'commission', 'currency', 'reservationNumber', 'uploadedAt', 
      'uploadedBy', 'tag'
    ]);

    const rows = await sheet.getRows();
    return rows.map((row: any) => ({
      id: row.get('id') || '',
      propertyName: row.get('propertyName') || '',
      location: row.get('location') || '',
      bookerName: row.get('bookerName') || '',
      geniusBooker: row.get('geniusBooker') || '',
      arrival: row.get('arrival') || '',
      departure: row.get('departure') || '',
      bookedOn: row.get('bookedOn') || '',
      status: row.get('status') || '',
      totalPayment: parseFloat(row.get('totalPayment')) || 0,
      commission: parseFloat(row.get('commission')) || 0,
      currency: row.get('currency') || '',
      reservationNumber: row.get('reservationNumber') || '',
      uploadedAt: row.get('uploadedAt') || '',
      uploadedBy: row.get('uploadedBy') || '',
      tag: row.get('tag') || ''
    }));
  } catch (error) {
    console.error("Failed to read Reservations from Google Sheets", error);
    return [];
  }
}

export async function saveReservations(records: Partial<ReservationRecord>[]) {
  try {
    const doc = await getGoogleSheet();
    if (!doc) throw new Error("Failed to connect to Google Sheets");

    const sheet = await getOrCreateSheet(doc, RESERVATIONS_SHEET_TITLE, [
      'id', 'propertyName', 'location', 'bookerName', 'geniusBooker', 
      'arrival', 'departure', 'bookedOn', 'status', 'totalPayment', 
      'commission', 'currency', 'reservationNumber', 'uploadedAt', 
      'uploadedBy', 'tag'
    ]);

    await sheet.addRows(records);
    return true;
  } catch (error) {
    console.error("Failed to save Reservations to Google Sheets", error);
    return false;
  }
}

export async function getUploadLogs(): Promise<UploadLog[]> {
  try {
    const doc = await getGoogleSheet();
    if (!doc) throw new Error("Failed to connect to Google Sheets");

    const sheet = await getOrCreateSheet(doc, UPLOAD_LOGS_SHEET_TITLE, [
      'id', 'fileName', 'uploadDate', 'uploadedBy', 'newRecords', 'duplicates'
    ]);

    const rows = await sheet.getRows();
    return rows.map((row: any) => ({
      id: row.get('id') || '',
      fileName: row.get('fileName') || '',
      uploadDate: row.get('uploadDate') || '',
      uploadedBy: row.get('uploadedBy') || '',
      newRecords: parseInt(row.get('newRecords')) || 0,
      duplicates: parseInt(row.get('duplicates')) || 0
    })).reverse(); // Return newest first
  } catch (error) {
    console.error("Failed to read UploadLogs from Google Sheets", error);
    return [];
  }
}

export async function saveUploadLog(log: UploadLog) {
  try {
    const doc = await getGoogleSheet();
    if (!doc) throw new Error("Failed to connect to Google Sheets");

    const sheet = await getOrCreateSheet(doc, UPLOAD_LOGS_SHEET_TITLE, [
      'id', 'fileName', 'uploadDate', 'uploadedBy', 'newRecords', 'duplicates'
    ]);

    await sheet.addRow(log);
    return true;
  } catch (error) {
    console.error("Failed to save UploadLog to Google Sheets", error);
    return false;
  }
}
