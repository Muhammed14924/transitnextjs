import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Protect all /api/* routes -> let them handle their own auth (don't block here)
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // If no session on protected route -> redirect to /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/shipments/:path*', '/settings/:path*'],
};
