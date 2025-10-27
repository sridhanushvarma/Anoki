import { NextRequest, NextResponse } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/api/auth/me',
  '/api/user',
  '/profile',
  '/dashboard',
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/auth',
  '/',
  '/ai-tools',
  '/converters',
  '/detectors',
  '/contact',
  '/privacy',
  '/terms',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Add security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // CSRF protection for state-changing operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    // Check if origin matches host for CSRF protection
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { error: 'CSRF protection: Origin mismatch' },
        { status: 403 }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images).*)',
  ],
}
