// Test script



// Because it's TS, let's just write a plain JS script.
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

async function test() {
  console.log("Email:", process.env.GOOGLE_CLIENT_EMAIL);
  console.log("Key length:", process.env.GOOGLE_PRIVATE_KEY?.length);
  console.log("Spreadsheet ID:", process.env.GOOGLE_SPREADSHEET_ID);
  
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID || '', serviceAccountAuth);
    await doc.loadInfo();
    console.log("Success! Document title:", doc.title);
    
    // Test users sheet
    const USERS_SHEET_TITLE = 'Users';
    let sheet = doc.sheetsByTitle[USERS_SHEET_TITLE];
    if (!sheet) {
      console.log("Users sheet not found, creating...");
      sheet = await doc.addSheet({ headerValues: ['id', 'username', 'passwordHash', 'role', 'createdAt'], title: USERS_SHEET_TITLE });
      await sheet.addRow({
        id: '1',
        username: 'admin',
        passwordHash: '$2b$10$n8kvu5X5sujqMkk4OI5EEOqMRtTApD6S3gnI6QJjlxno4MOC3MfI2', // '1234'
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      console.log("Created users sheet and added admin.");
    } else {
      console.log("Users sheet exists.");
      await sheet.setHeaderRow(['id', 'username', 'passwordHash', 'role', 'createdAt']);
      const rows = await sheet.getRows();
      console.log("Rows count:", rows.length);
      if (rows.length === 0) {
        console.log("No users found. Injecting default admin...");
        await sheet.addRow({
          id: '1',
          username: 'admin',
          passwordHash: '$2b$10$n8kvu5X5sujqMkk4OI5EEOqMRtTApD6S3gnI6QJjlxno4MOC3MfI2', // '1234'
          role: 'ADMIN',
          createdAt: new Date().toISOString()
        });
        console.log("Admin injected successfully.");
      }
    }
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
