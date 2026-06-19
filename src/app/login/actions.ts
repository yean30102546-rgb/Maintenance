'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function mockLogin() {
  const cookieStore = await cookies();
  
  // Create a random mock session ID (resembling a UUID)
  const mockId = crypto.randomUUID();
  
  // Set the mock cookie
  cookieStore.set('mock_session_id', mockId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  
  // Redirect to dashboard (layout will handle redirect to register if user doesn't exist in DB)
  redirect('/dashboard');
}
