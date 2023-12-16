import { prisma } from '../db/db.js';

export const createUser = async () => {
  return await prisma.user.create({
    data: {},
  });
};