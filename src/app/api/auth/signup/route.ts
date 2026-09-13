import { NextResponse } from 'next/server';
import { readLocalUsers, writeLocalUsers, User } from '@/lib/db/users';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = readLocalUsers();
    
    if (users.find(u => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeLocalUsers(users);

    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({ 
      message: 'User created successfully', 
      user: safeUser 
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
