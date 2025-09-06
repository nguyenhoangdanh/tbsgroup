// Mock auth configuration for build environment
// In production, replace with actual NextAuth configuration

export const authOptions = {
  providers: [],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/admin/login' },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      return session;
    },
  },
};

// Mock NextAuth function
const NextAuth = (options: any) => ({
  GET: async () => new Response('Mock auth'),
  POST: async () => new Response('Mock auth'),
});

export default NextAuth;