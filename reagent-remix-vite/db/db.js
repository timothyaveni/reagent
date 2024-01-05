import { PrismaClient } from '@prisma/client'

// todo: in prod, use env var probably
export const prisma = new PrismaClient();