import { NextResponse } from 'next/server';

let registrations = [];

export async function POST(request) {
  try {
    const { name, email, org } = await request.json();
    
    if (!name || !email || !org) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const registration = {
      name,
      email,
      org,
      timestamp: new Date().toISOString()
    };

    registrations.push(registration);
    console.log('New registration:', JSON.stringify(registration));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = searchParams.get('key');
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ registrations });
}

export const dynamic = 'force-dynamic';
