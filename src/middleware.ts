import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't need auth
  if (pathname.startsWith('/login') || pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  const sessionId = request.cookies.get('session_id')?.value

  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
