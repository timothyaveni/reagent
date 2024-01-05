import { prisma } from '../db/db';
import { NogginRunStatus as NogginRunStatusEnum } from '../db/db';
import { NogginRunStatus as NogginRunStatusEnumWithType } from '@prisma/client';
import type {NogginRunStatus as NogginRunStatusType} from '@prisma/client';

// this is super yucky and relies on the 'EnumWithType' import being tree-shaken, i think.
// but the prisma import is weird...
export default prisma;
export const NogginRunStatus: typeof NogginRunStatusEnumWithType = NogginRunStatusEnum;
export type { NogginRunStatusType };