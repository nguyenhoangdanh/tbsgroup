import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.adminUser.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Extract locale from the URL or default to 'vi'
      const urlObj = new URL(url.startsWith('http') ? url : baseUrl + url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      const supportedLocales = ['vi', 'en', 'id'];
      const locale = supportedLocales.includes(pathSegments[0]) ? pathSegments[0] : 'vi';
      
      // Redirect to admin dashboard after login with proper locale
      if (url.includes('/api/auth/signin') || url.includes('callbackUrl')) {
        return `${baseUrl}/${locale}/admin`;
      }
      
      // Ensure the URL has a locale prefix
      if (url.startsWith(baseUrl)) {
        const relativePath = url.replace(baseUrl, '');
        if (!supportedLocales.some(loc => relativePath.startsWith(`/${loc}`))) {
          return `${baseUrl}/${locale}${relativePath}`;
        }
        return url;
      }
      
      return `${baseUrl}/${locale}`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};