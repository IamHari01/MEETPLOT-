import { NextResponse } from 'next/server';
import { readLocalUsers } from '@/lib/db/users';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = readLocalUsers();
    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Incorrect ID or password.' }, { status: 401 });
    }

    // Don't send password back to the client
    const { password: _, ...safeUser } = user;

    return NextResponse.json({ 
      message: 'Login successful', 
      user: safeUser 
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 });
  }
}
