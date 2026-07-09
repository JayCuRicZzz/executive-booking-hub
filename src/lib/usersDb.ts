import { getGoogleSheet } from './googleSheets';

export type UserRole = 'ADMIN' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

const USERS_SHEET_TITLE = 'Users';

async function getOrCreateUsersSheet() {
  const doc = await getGoogleSheet();
  if (!doc) throw new Error("Failed to connect to Google Sheets");

  let sheet = doc.sheetsByTitle[USERS_SHEET_TITLE];
  if (!sheet) {
    sheet = await doc.addSheet({ headerValues: ['id', 'username', 'passwordHash', 'role', 'createdAt'], title: USERS_SHEET_TITLE });
    
    // Add default admin immediately if the sheet was just created
    await sheet.addRow({
      id: '1',
      username: 'admin',
      passwordHash: '$2b$10$n8kvu5X5sujqMkk4OI5EEOqMRtTApD6S3gnI6QJjlxno4MOC3MfI2', // '1234'
      role: 'ADMIN',
      createdAt: new Date().toISOString()
    });
  }
  return sheet;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const sheet = await getOrCreateUsersSheet();
    const rows = await sheet.getRows();
    
    return rows.map(row => ({
      id: row.get('id'),
      username: row.get('username'),
      passwordHash: row.get('passwordHash'),
      role: row.get('role') as UserRole,
      createdAt: row.get('createdAt')
    }));
  } catch (error) {
    console.error("Failed to read Users from Google Sheets", error);
    return [];
  }
};

export const saveUsers = async (users: User[]) => {
  try {
    const sheet = await getOrCreateUsersSheet();
    await sheet.clearRows(); // Warning: clears all existing rows to rewrite
    
    // Alternatively, we could append, but to keep the exact same API signature as before:
    const rowsToAdd = users.map(u => ({
      id: u.id,
      username: u.username,
      passwordHash: u.passwordHash,
      role: u.role,
      createdAt: u.createdAt
    }));
    
    if (rowsToAdd.length > 0) {
      await sheet.addRows(rowsToAdd);
    }
  } catch (error) {
    console.error("Failed to write Users to Google Sheets", error);
  }
};
