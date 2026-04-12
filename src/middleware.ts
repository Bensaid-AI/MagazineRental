import { NextResponse, NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-secret-key'
)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protected routes
  const protectedRoutes = ['/dashboard', '/api/profiles']
  const publicRoutes = ['/auth/login', '/auth/register', '/']

  // Check if trying to access protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Get auth token from cookies
  const token = request.cookies.get('sb:token')?.value

  if (isProtectedRoute && !token) {
    // No token, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If has token, verify it (optional but recommended)
  if (token) {
    try {
      await jwtVerify(token, secret)
      // Token is valid, proceed
      return NextResponse.next()
    } catch (err) {
      // Token is invalid, clear it and redirect
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('sb:token')
      return response
    }
  }

  // Allow public routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/profiles/:path*',
  ],
}
