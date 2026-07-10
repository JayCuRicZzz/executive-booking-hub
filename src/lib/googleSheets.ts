import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

let docCache: GoogleSpreadsheet | null = null;
let docCacheTime = 0;
const DOC_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getGoogleSheet() {
  if (docCache && Date.now() - docCacheTime < DOC_CACHE_TTL) {
    return docCache;
  }

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    // Replace literal \n with actual newline characters
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID || '', serviceAccountAuth);
  
  try {
    await doc.loadInfo();
    docCache = doc;
    docCacheTime = Date.now();
    return doc;
  } catch (error) {
    console.error("Error loading Google Sheet:", error);
    return null;
  }
}
