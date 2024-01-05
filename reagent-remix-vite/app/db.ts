import { prisma } from '../db/db';

// this is super yucky and relies on the 'EnumWithType' import being tree-shaken, i think.
// but the prisma import is weird...
export default prisma;