// Mock Prisma client for build environment
// In production, this will be replaced with actual Prisma client

export const prisma = {
  adminUser: {
    findUnique: async () => null,
    upsert: async () => ({}),
  },
  customerInquiry: {
    create: async () => ({}),
    findMany: async () => [],
    count: async () => 0,
  },
  $disconnect: async () => {},
} as any;