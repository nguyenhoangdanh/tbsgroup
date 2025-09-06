import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle admin routes protection
  if (pathname.includes('/admin') && !pathname.includes('/admin/login')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const locale = pathname.split('/')[1] || 'vi';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(vi|en|id)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};