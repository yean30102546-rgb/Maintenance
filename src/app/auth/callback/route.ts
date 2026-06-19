import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user exists in Prisma
      const dbUser = await prisma.user.findUnique({
        where: {
          supabaseAuthId: data.user.id,
        },
      })
      
      if (dbUser) {
        // User is already registered with role, redirect to repair
        return NextResponse.redirect(`${origin}/repair`)
      } else {
        // Need to complete profile/registration
        return NextResponse.redirect(`${origin}/register`)
      }
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
