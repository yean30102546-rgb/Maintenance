import { PrismaClient } from '@prisma/client';
import * as dns from 'dns';

// Force IPv4 to prevent Supabase pooler ETIMEDOUT issues on Windows/Node.js
dns.setDefaultResultOrder('ipv4first');

const globalForPrisma = globalThis as unknown as { prisma_v3: PrismaClient };

const createPrismaClient = () => {
  return new PrismaClient();
};

export const prisma = globalForPrisma.prisma_v3 || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v3 = prisma;
