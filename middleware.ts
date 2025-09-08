import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for NextAuth API routes completely
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Skip middleware for other API routes but still apply intl
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Handle admin routes protection
  if (pathname.includes('/admin') && !pathname.includes('/admin/login')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Extract locale from pathname with fallback
      const pathSegments = pathname.split('/').filter(Boolean);
      const supportedLocales = ['vi', 'en', 'id'];
      const locale = supportedLocales.includes(pathSegments[0]) ? pathSegments[0] : 'vi';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames, exclude API routes
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(vi|en|id)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|api|.*\\..*).*)'
  ]
};