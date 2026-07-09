import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUsers, saveUsers, User } from '@/lib/usersDb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper to check admin access
async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;

  try {
    const payloadBase64 = token.split('.')[1];
    const payloadString = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(payloadString);
    return payload.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const users = await getUsers();
  // Don't send password hashes to client
  const safeUsers = users.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt }));
  return NextResponse.json({ users: safeUsers });
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { username, password, role } = await request.json();
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const users = await getUsers();
    if (users.find(u => u.username === username)) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: Date.now().toString(),
      username,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const users = await getUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    
    if (filteredUsers.length === users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await saveUsers(filteredUsers);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
