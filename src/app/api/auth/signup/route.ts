import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Mock authentication for easy testing
    // Accepts any credentials and instantly creates a mock user!
    return NextResponse.json({ 
      message: 'User created successfully', 
      user: { id: 'mock-new-user-id', email } 
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
