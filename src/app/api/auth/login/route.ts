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

    const user = users.find((u: any) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'Incorrect ID or password.' }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Incorrect ID or password.' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login successful', user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 });
  }
}
