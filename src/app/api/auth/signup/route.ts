import { NextResponse } from 'next/server';
import { supabaseAuthClient } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAuthClient
      .from('app_users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Insert new user
    const { data: newUser, error } = await supabaseAuthClient
      .from('app_users')
      .insert([{ email, password }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return NextResponse.json({ message: 'User created successfully', user: newUser });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
