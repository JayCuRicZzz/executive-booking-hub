import { getGoogleSheet } from './googleSheets';

const RESERVATIONS_SHEET_TITLE = 'Reservations';
const UPLOAD_LOGS_SHEET_TITLE = 'UploadLogs';
const TARGETS_SHEET_TITLE = 'Targets';

export type TargetRecord = {
  propertyName: string;
  year: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
};

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

// In-memory cache variables
let reservationsCache: ReservationRecord[] | null = null;
let reservationsCacheTime = 0;
let targetsCache: TargetRecord[] | null = null;
let targetsCacheTime = 0;
let logsCache: UploadLog[] | null = null;
let logsCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export function clearDataCache() {
  reservationsCache = null;
  targetsCache = null;
  logsCache = null;
}

export async function getReservations(): Promise<ReservationRecord[]> {
  if (reservationsCache && Date.now() - reservationsCacheTime < CACHE_TTL) {
    return reservationsCache;
  }
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
    const result = rows.map((row: any) => ({
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
    
    reservationsCache = result;
    reservationsCacheTime = Date.now();
    return result;
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
    clearDataCache();
    return true;
  } catch (error) {
    console.error("Failed to save Reservations to Google Sheets", error);
    return false;
  }
}

export async function getUploadLogs(): Promise<UploadLog[]> {
  if (logsCache && Date.now() - logsCacheTime < CACHE_TTL) {
    return logsCache;
  }
  try {
    const doc = await getGoogleSheet();
    if (!doc) throw new Error("Failed to connect to Google Sheets");

    const sheet = await getOrCreateSheet(doc, UPLOAD_LOGS_SHEET_TITLE, [
      'id', 'fileName', 'uploadDate', 'uploadedBy', 'newRecords', 'duplicates'
    ]);

    const rows = await sheet.getRows();
    const result = rows.map((row: any) => ({
      id: row.get('id') || '',
      fileName: row.get('fileName') || '',
      uploadDate: row.get('uploadDate') || '',
      uploadedBy: row.get('uploadedBy') || '',
      newRecords: parseInt(row.get('newRecords')) || 0,
      duplicates: parseInt(row.get('duplicates')) || 0,
    })).reverse();
    
    logsCache = result;
    logsCacheTime = Date.now();
    return result;
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
    clearDataCache();
    return true;
  } catch (error) {
    console.error("Failed to save UploadLog to Google Sheets", error);
    return false;
  }
}

export async function getTargets(): Promise<TargetRecord[]> {
  if (targetsCache && Date.now() - targetsCacheTime < CACHE_TTL) {
    return targetsCache;
  }
  try {
    const doc = await getGoogleSheet();
    if (!doc) throw new Error("Failed to connect to Google Sheets");

    const sheet = await getOrCreateSheet(doc, TARGETS_SHEET_TITLE, [
      'propertyName', 'year', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ]);

    const rows = await sheet.getRows();
    const result = rows.map((row: any) => ({
      propertyName: row.get('propertyName') || '',
      year: parseInt(row.get('year')) || new Date().getFullYear(),
      jan: parseFloat(row.get('jan')) || 0,
      feb: parseFloat(row.get('feb')) || 0,
      mar: parseFloat(row.get('mar')) || 0,
      apr: parseFloat(row.get('apr')) || 0,
      may: parseFloat(row.get('may')) || 0,
      jun: parseFloat(row.get('jun')) || 0,
      jul: parseFloat(row.get('jul')) || 0,
      aug: parseFloat(row.get('aug')) || 0,
      sep: parseFloat(row.get('sep')) || 0,
      oct: parseFloat(row.get('oct')) || 0,
      nov: parseFloat(row.get('nov')) || 0,
      dec: parseFloat(row.get('dec')) || 0,
    }));
    
    targetsCache = result;
    targetsCacheTime = Date.now();
    return result;
  } catch (error) {
    console.error("Failed to read Targets from Google Sheets", error);
    return [];
  }
}

export async function saveTargets(targets: TargetRecord[]) {
  try {
    const doc = await getGoogleSheet();
    if (!doc) throw new Error("Failed to connect to Google Sheets");

    const sheet = await getOrCreateSheet(doc, TARGETS_SHEET_TITLE, [
      'propertyName', 'year', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ]);

    await sheet.clear();
    await sheet.setHeaderRow([
      'propertyName', 'year', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ]);
    
    if (targets.length > 0) {
      await sheet.addRows(targets);
    }
    clearDataCache();
    return true;
  } catch (error) {
    console.error("Failed to save Targets to Google Sheets", error);
    return false;
  }
}
