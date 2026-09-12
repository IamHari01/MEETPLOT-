import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), 'data', 'users.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const users = JSON.parse(fileContents);

    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = { email, password };
    users.push(newUser);

    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));

    return NextResponse.json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
