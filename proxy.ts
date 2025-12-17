import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow access to admin routes only for authenticated users
    if (req.nextUrl.pathname.startsWith('/admin') && !req.nextauth.token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    
    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/admin/login',
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    // Exclude static files and API routes from middleware
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
