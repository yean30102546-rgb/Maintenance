import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard by default. Middleware will handle unauthenticated access.
  redirect('/dashboard');
}
