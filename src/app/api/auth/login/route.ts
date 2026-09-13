import { NextResponse } from 'next/server';
import { supabaseDbClient } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Fetch user from Supabase app_users table
    const { data: user, error } = await supabaseDbClient
      .from('app_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Incorrect ID or password.' }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Incorrect ID or password.' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login successful', user });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 });
  }
}
