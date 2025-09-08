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
        console.log('=== AUTH DEBUG START ===');
        console.log('Environment check:');
        console.log('- NODE_ENV:', process.env.NODE_ENV);
        console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('- DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
        
        console.log('Received credentials:', {
          email: credentials?.email,
          passwordLength: credentials?.password?.length
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          console.log('Attempting to find user with email:', credentials.email);
          
          // First, let's check if user exists without status filter
          const userCheck = await prisma.adminUser.findUnique({
            where: { email: credentials.email }
          });
          console.log('User check result:', userCheck ? {
            id: userCheck.id,
            email: userCheck.email,
            role: userCheck.role,
            status: userCheck.status
          } : 'User not found');

          const user = await prisma.adminUser.findUnique({
            where: { 
              email: credentials.email,
              status: 'ACTIVE'
            }
          });

          if (!user) {
            console.log('User not found or inactive for email:', credentials.email);
            return null;
          }

          console.log('User found:', {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status
          });
          
          console.log('Checking password...');
          console.log('Stored hash length:', user.password.length);
          console.log('Input password:', credentials.password);
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          console.log('Authentication successful for user:', user.email);
          console.log('=== AUTH DEBUG END ===');
          
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