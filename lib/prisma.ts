import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'], // Thêm logging để debug
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Debug connection
console.log('Prisma client initialized with DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');