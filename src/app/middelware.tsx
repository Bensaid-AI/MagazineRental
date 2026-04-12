import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/api/profiles', '/api/auth/logout']

  // Public routes that don't need auth
  const publicRoutes = ['/auth/login', '/auth/register', '/']

  // Check if user has a session cookie (Supabase sets this)
  const supabaseAuth = request.cookies.get('sb-auth-token')

  // If trying to access protected route without auth
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !supabaseAuth) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If already logged in and trying to access auth pages, redirect to dashboard
  if (publicRoutes.includes(pathname) && supabaseAuth && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/api/profiles/:path*',
    '/api/auth/logout',
    // Auth routes
    '/auth/:path*',
  ],
}