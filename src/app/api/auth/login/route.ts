import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Mock authentication for easy testing
    // Accepts any credentials and instantly logs the user in!
    return NextResponse.json({ 
      message: 'Login successful', 
      user: { id: `mock-${email}-id`, email } 
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 });
  }
}
