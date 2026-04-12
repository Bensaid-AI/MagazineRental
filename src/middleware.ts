import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protected routes
  const protectedRoutes = ['/dashboard', '/api/profiles']

  // Check if trying to access protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Get auth token from cookies
  const token = request.cookies.get('sb:token')?.value

  console.log(`[Middleware] Route: ${pathname}, HasToken: ${!!token}, IsProtected: ${isProtectedRoute}`)

  if (isProtectedRoute && !token) {
    console.log(`[Middleware] Unauthorized - redirecting to /auth/login`)
    // No token, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Token exists or public route, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/profiles/:path*',
  ],
}

