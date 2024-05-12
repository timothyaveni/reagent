import { Prisma } from '@prisma/client';
import { AppLoadContext } from '@remix-run/server-runtime';
import {
  createFakeUserContext_OMNIPOTENT,
  requireUser,
} from '~/auth/auth.server';
import prisma from '~/db';
import {
  createBoostrappedRevisionForNoggin_OMNIPOTENT,
  createInitialRevisionForNoggin_OMNIPOTENT,
} from './nogginRevision.server';

import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import {
  NumberDictionary,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';
import { getAIModel_OMNISCIENT } from './aiModel.server.js';
import { getNogginTotalAllocatedCreditQuastra } from './nogginRuns.server';
import {
  getPermittedAdditionalBudgetForOrganizationAndOwner,
  hasAtLeastUserOrganizationRole,
  isModelEnabledForOrganization,
  requireAtLeastUserOrganizationRole,
} from './organization.server';
import {
  requireUserMayParticipateInTeam,
  userMayParticipateInTeam,
} from './team.server';

const authorizeNogginCreation = async (
  context: AppLoadContext,
  nogginData: {
    ownerType: 'user' | 'team';
    ownerId: number;
    containingOrganizationId: number | null;
    name: string;
    budgetQuastra: bigint | null;
    aiModelId?: number;
  },
) => {
  const user = requireUser(context);

  if (nogginData.ownerType === 'user' && nogginData.ownerId !== user.id) {
    throw new Error('Cannot create noggin for another user');
  } else if (nogginData.ownerType === 'team') {
    await requireUserMayParticipateInTeam(context, nogginData.ownerId);
  }

  const { containingOrganizationId } = nogginData;
  if (containingOrganizationId !== null) {
    await requireAtLeastUserOrganizationRole(context, {
      organizationId: containingOrganizationId,
      role: OrganizationRole.MEMBER,
    });
  }

  // TODO: here is where we would authenticate that you're permitted to create a noggin with this model
  // (or that you/your org has an api key for this model)

  // console.log({
  //   data: {
  //     slug,
  //     title: nogginData.name || slug,
  //     aIModelId: nogginData.aiModelId,
  //     ...(nogginData.ownerType === 'user'
  //       ? {
  //           userOwnerId: nogginData.ownerId,
  //         }
  //       : {
  //           teamOwnerId: nogginData.ownerId,
  //         }),
  //   },
  // });

  if (containingOrganizationId) {
    const teamOwnerId =
      nogginData.ownerType === 'team' ? nogginData.ownerId : null;

    const permittedAdditionalSpend =
      await getPermittedAdditionalBudgetForOrganizationAndOwner(context, {
        organizationId: containingOrganizationId,
        teamOwnerId,
      });

    if (permittedAdditionalSpend !== null) {
      if (
        nogginData.budgetQuastra === null ||
        nogginData.budgetQuastra > permittedAdditionalSpend
      ) {
        throw new Error('Not permitted to allocate that much budget');
      }
    }

    if (nogginData.aiModelId !== undefined) {
      const modelEnabled = await isModelEnabledForOrganization(context, {
        organizationId: containingOrganizationId,
        modelId: nogginData.aiModelId,
      });

      if (!modelEnabled) {
        throw new Error('Model not enabled for organization');
      }
    }
  }
};

const nogginOwnerData = (nogginData: {
  ownerType: 'user' | 'team';
  ownerId: number;
  containingOrganizationId: number | null;
}):
  | {
      userOwner: { connect: { id: number } };
      parentOrg?: { connect: { id: number } };
    }
  | {
      teamOwner: { connect: { id: number } };
      parentOrg?: { connect: { id: number } }; // strictly speaking this shouldn't have ? but ts isn't convinced and i don't want to bring it all up
    } => {
  return {
    ...(nogginData.ownerType === 'user'
      ? {
          userOwner: {
            connect: {
              id: nogginData.ownerId,
            },
          },
        }
      : {
          teamOwner: {
            connect: {
              id: nogginData.ownerId,
            },
          },
        }),
    ...(nogginData.containingOrganizationId !== null
      ? {
          parentOrg: { connect: { id: nogginData.containingOrganizationId } },
        }
      : {}),
  };
};

export const createNoggin = async (
  context: AppLoadContext,
  nogginData: {
    ownerType: 'user' | 'team';
    ownerId: number;
    containingOrganizationId: number | null;
    aiModelId: number;
    name: string;
    budgetQuastra: bigint | null;
  },
) => {
  const user = requireUser(context);

  await authorizeNogginCreation(context, nogginData);

  // there is a race condition of course but the database has a uniqueness constraint. user will live
  const slug = await generateFreeSlug();

  const noggin = await prisma.noggin.create({
    data: {
      slug,
      title: nogginData.name || slug,
      aiModel: { connect: { id: nogginData.aiModelId } },
      totalAllocatedCreditQuastra: nogginData.budgetQuastra,
      ...nogginOwnerData(nogginData),
    },
  });

  await createInitialRevisionForNoggin_OMNIPOTENT(noggin.id);

  return noggin;
};

export const createProvisionalNoggin = async (
  context: AppLoadContext,
  nogginData: {
    ownerType: 'user' | 'team';
    ownerId: number;
    containingOrganizationId: number | null;
    name: string;
    budgetQuastra: bigint | null;
    initialRevisionData: object | null;
  },
) => {
  const user = requireUser(context);

  await authorizeNogginCreation(context, nogginData);

  const expiresAt = DateTime.now().plus({ minutes: 30 }).toJSDate(); // TODO make sure you use this
  const linkingCode = uuidv4();

  return await prisma.provisionalNoggin.create({
    data: {
      title: nogginData.name,
      totalAllocatedCreditQuastra: nogginData.budgetQuastra,
      ...nogginOwnerData(nogginData),
      expiresAt,
      linkingCode,
      userInitiator: {
        connect: {
          id: user.id,
        },
      },
    },
  });
};

// this isn't quite omnipotent -- it requires the linking code for authentication in this case, and then we will
// create an appropriate user context -- but the point is it doesn't use context
export const convertProvisionalNogginToNoggin_OMNIPOTENT = async ({
  linkingCode,
  modelProviderName,
  aiModelName,
  aiModelRevision,
  initialRevision,
}: {
  linkingCode: string;
  modelProviderName: string;
  aiModelName: string;
  aiModelRevision: string;
  initialRevision: object;
}) => {
  const provisionalNoggin = await prisma.provisionalNoggin.findUnique({
    where: {
      linkingCode,
    },
    select: {
      id: true,
      expiresAt: true,
      userInitiatorId: true,

      createdNogginId: true,

      title: true,
      totalAllocatedCreditQuastra: true,
      userOwnerId: true,
      teamOwnerId: true,
      parentOrgId: true,
    },
  });

  if (!provisionalNoggin) {
    throw new Error('Provisional noggin not found');
  }

  if (provisionalNoggin.expiresAt < new Date()) {
    throw new Error('Provisional noggin expired');
  }

  if (provisionalNoggin.createdNogginId !== null) {
    throw new Error('Provisional noggin already converted');
  }

  const context = createFakeUserContext_OMNIPOTENT({
    id: provisionalNoggin.userInitiatorId,
  });

  const aiModel = await getAIModel_OMNISCIENT({
    modelProviderName,
    modelName: aiModelName,
    revision: aiModelRevision,
  });

  const {
    ownerType,
    ownerId,
  }: {
    ownerType: 'user' | 'team';
    ownerId: number;
  } =
    provisionalNoggin.userOwnerId !== null
      ? { ownerType: 'user', ownerId: provisionalNoggin.userOwnerId }
      : { ownerType: 'team', ownerId: provisionalNoggin.teamOwnerId! };

  const noggin = await createNoggin(context, {
    ownerType,
    ownerId,
    containingOrganizationId: provisionalNoggin.parentOrgId,
    aiModelId: aiModel.id,
    name: provisionalNoggin.title,
    budgetQuastra: provisionalNoggin.totalAllocatedCreditQuastra,
  });

  if (initialRevision === null) {
    const nogginRevision = await createInitialRevisionForNoggin_OMNIPOTENT(
      noggin.id,
    );
  } else {
    const nogginRevision = await createBoostrappedRevisionForNoggin_OMNIPOTENT(
      noggin.id,
      initialRevision,
    );
  }

  await prisma.provisionalNoggin.update({
    where: {
      id: provisionalNoggin.id,
    },
    data: {
      createdNogginId: noggin.id,
    },
  });

  return noggin;
};

export const getInitiatorForProvisionalNoggin_OMNISCIENT = async (
  provisionalNogginId: number,
) => {
  const provisionalNoggin = await prisma.provisionalNoggin.findUnique({
    where: {
      id: provisionalNogginId,
    },
    select: {
      userInitiatorId: true,
    },
  });

  if (!provisionalNoggin) {
    throw new Error('Provisional noggin not found');
  }

  return provisionalNoggin.userInitiatorId;
};

const randomSlug = () => {
  const numberDictionary = NumberDictionary.generate({ min: 1000, max: 9999 });
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals, numberDictionary],
    length: 3,
    separator: '-',
    style: 'lowerCase',
  });
};

const generateFreeSlug = async () => {
  let tries = 0;
  while (tries < 10) {
    const slug = randomSlug();
    const noggin = await prisma.noggin.findUnique({
      where: {
        slug,
      },
    });

    if (!noggin) {
      return slug;
    }
  }

  throw new Error('Could not generate a free slug');
};

export const loadNogginBySlug = async (
  context: AppLoadContext,
  { slug }: { slug: string | null | undefined },
) => {
  if (!slug) {
    throw notFound();
  }

  requireUser(context);

  const noggin = await prisma.noggin.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      aiModel: {
        // todo -- is it a mistake to grab all this here
        select: {
          id: true,
          name: true,
          modelProvider: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      userOwnerId: true,
      teamOwnerId: true,
      parentOrgId: true,
    },
  });

  await authorizeNoggin(context, {
    nogginId: noggin?.id,
  });

  if (!noggin) {
    throw notFound();
  }

  return noggin;
};

export const loadProvisionalNoggin = async (
  context: AppLoadContext,
  { id }: { id: number },
) => {
  const user = requireUser(context);

  const provisionalNoggin = await prisma.provisionalNoggin.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userInitiatorId: true,
      linkingCode: true,
      expiresAt: true,
      createdNoggin: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!provisionalNoggin) {
    throw notFound();
  }

  if (provisionalNoggin.userInitiatorId !== user.id) {
    throw notFound();
  }

  if (provisionalNoggin.expiresAt < new Date()) {
    throw notFound();
  }

  return provisionalNoggin;
};

export const authorizeNoggin = async (
  context: AppLoadContext,
  {
    nogginId,
  }: // permissions,
  {
    nogginId: number | null | undefined;
    // permissions:
  },
) => {
  if (!nogginId) {
    throw notFound();
  }

  const user = requireUser(context);

  const noggin = await prisma.noggin.findUnique({
    where: {
      id: nogginId,
    },
    select: {
      userOwnerId: true,
      teamOwnerId: true,
      parentOrgId: true,
    },
  });

  if (!noggin) {
    throw notFound();
  }

  if (noggin.userOwnerId === user.id) {
    return true;
  }

  if (noggin.parentOrgId !== null) {
    if (
      await hasAtLeastUserOrganizationRole(context, {
        organizationId: noggin.parentOrgId,
        role: OrganizationRole.MANAGER,
      })
    ) {
      return true;
    }

    if (noggin.teamOwnerId !== null) {
      if (await userMayParticipateInTeam(context, noggin.teamOwnerId)) {
        return true;
      }
    }
  }

  // TODO
  // show if:
  // - noggin is user-owned and this is that user (todo: merges)

  throw notFound();
};

export const updateNogginTitle = async (
  context: AppLoadContext,
  { nogginSlug, title }: { nogginSlug: string; title: string },
) => {
  const user = requireUser(context);

  const noggin = await prisma.noggin.findUnique({
    where: {
      slug: nogginSlug,
    },
    select: {
      id: true,
      userOwnerId: true,
    },
  });

  await authorizeNoggin(context, {
    nogginId: noggin?.id,
  });

  await prisma.noggin.update({
    where: {
      slug: nogginSlug,
    },
    data: {
      title,
    },
  });

  return true;
};

export const updateNogginBudget = async (
  context: AppLoadContext,
  {
    nogginId,
    budgetQuastra,
  }: {
    nogginId: number;
    budgetQuastra: bigint | null;
  },
) => {
  await authorizeNoggin(context, {
    nogginId,
  });

  const nogginWithOrgAndTeamId = await prisma.noggin.findUnique({
    where: {
      id: nogginId,
    },
    select: {
      parentOrgId: true,
      teamOwnerId: true,
    },
  });

  if (!nogginWithOrgAndTeamId) {
    throw new Error('Noggin not found');
  }

  const { parentOrgId } = nogginWithOrgAndTeamId;

  if (parentOrgId) {
    const permittedAdditionalSpend =
      await getPermittedAdditionalBudgetForOrganizationAndOwner(context, {
        organizationId: parentOrgId,
        teamOwnerId: nogginWithOrgAndTeamId.teamOwnerId, // may be null
      });

    if (permittedAdditionalSpend !== null) {
      const permittedAdditionalSpendIncludingThisNoggin =
        permittedAdditionalSpend +
        ((await getNogginTotalAllocatedCreditQuastra(context, {
          nogginId,
        })) || 0);

      if (
        budgetQuastra === null ||
        budgetQuastra > permittedAdditionalSpendIncludingThisNoggin
      ) {
        throw new Error('Not permitted to allocate that much budget');
      }
    }
  }

  await prisma.noggin.update({
    where: {
      id: nogginId,
    },
    data: {
      totalAllocatedCreditQuastra: budgetQuastra,
    },
  });
};

type NogginIndexQueryType = {
  id: number;
  slug: string;
  title: string;
  aiModelName: string;
  modelProviderName: string;
  parentOrgName: string;
  teamOwnerName: string;
  latestNogginRevisionUpdatedAt: Date;
  latestNogginRevisionId: number;
  latestNogginRevisionNogginVariables: any;
  latestNogginRevisionOutputSchema: any;
  nonFailingRunCount: bigint;
}[];

const NOGGIN_INDEX_SELECT = `
  select
      "Noggin"."id",
      "Noggin"."slug",
      "Noggin"."title",
      "AIModel"."name" as "aiModelName",
      "ModelProvider"."name" as "modelProviderName",
      "Organization"."name" as "parentOrgName",
      "Team"."name" as "teamOwnerName",
      "NogginRevision"."updatedAt" as "latestNogginRevisionUpdatedAt",
      "NogginRevision"."id" as "latestNogginRevisionId",
      "NogginRevision"."nogginVariables" as "latestNogginRevisionNogginVariables",
      "NogginRevision"."outputSchema" as "latestNogginRevisionOutputSchema",
      COALESCE("RunCount"."nonFailingRunCount", 0) as "nonFailingRunCount"
    from "Noggin"
    left join "AIModel" on "Noggin"."aiModelId" = "AIModel"."id"
    left join "ModelProvider" on "AIModel"."modelProviderId" = "ModelProvider"."id"
    left join "Organization" on "Noggin"."parentOrgId" = "Organization"."id"
    left join "Team" on "Noggin"."teamOwnerId" = "Team"."id"
    -- get just the most recent revision
    left join lateral (
      select
        "id",
        "updatedAt",
        "nogginVariables",
        "outputSchema"
      from "NogginRevision"
      where "nogginId" = "Noggin"."id"
      order by "updatedAt" desc
      limit 1
    ) as "NogginRevision" on true
    -- get all revisions' runs
    left join lateral (
      select
        "NogginRevision"."nogginId",
        count(*) as "nonFailingRunCount"
      from "NogginRevision"
      join "NogginRun" on "NogginRevision"."id" = "NogginRun"."nogginRevisionId"
      where "NogginRevision"."nogginId" = "Noggin"."id" and "NogginRun"."status" != 'failed'
      group by "NogginRevision"."nogginId"
    ) as "RunCount" on "RunCount"."nogginId" = "Noggin"."id"
`;

const NOGGIN_INDEX_PERSONAL_WHERE = `
  where
  (
    "Noggin"."userOwnerId" = $1
  ) or (
    "Noggin"."teamOwnerId" in (
      select
        "Team"."id"
      from "Team"
      inner join "_TeamToUser" on "Team"."id" = "_TeamToUser"."A"
      where
        "_TeamToUser"."B" = $1
    )
  )`;

const NOGGIN_INDEX_TEAM_WHERE = `
  where "Noggin"."teamOwnerId" = $1`;

const NOGGIN_INDEX_PAGE_INFO = `
  order by "NogginRevision"."updatedAt" desc
  limit $2
  offset $3`;

const reformatNogginIndex = (noggins: NogginIndexQueryType) => {
  // reformat to how prisma would return it if we didn't need to query raw
  return noggins.map((noggin) => {
    return {
      id: noggin.id,
      slug: noggin.slug,
      title: noggin.title,
      aiModel: {
        name: noggin.aiModelName,
        modelProvider: {
          name: noggin.modelProviderName,
        },
      },
      parentOrg:
        noggin.parentOrgName === null
          ? null
          : {
              name: noggin.parentOrgName,
            },
      teamOwner:
        noggin.teamOwnerName === null
          ? null
          : {
              name: noggin.teamOwnerName,
            },
      nogginRevisions: [
        {
          id: noggin.latestNogginRevisionId,
          updatedAt: noggin.latestNogginRevisionUpdatedAt,
          nogginVariables: noggin.latestNogginRevisionNogginVariables,
          outputSchema: noggin.latestNogginRevisionOutputSchema,
        },
      ],
      nonFailingRunCount: Number(noggin.nonFailingRunCount),
    };
  });
};

export const authorizeNoggins = async (
  context: AppLoadContext,
  noggins: { id: number }[],
) => {
  // double check auth for each noggin -- at least while we test this refactor
  // this will just hard error if it fails, which is spooky but not as spooky as a privacy sev!
  await Promise.all(
    noggins.map((noggin) =>
      authorizeNoggin(context, {
        nogginId: noggin.id,
      }),
    ),
  );
};

export const loadNogginsIndex = async (
  context: AppLoadContext,
  {
    pageSize = 20,
    pageZeroIndexed = 0,
  }: {
    pageSize: number;
    pageZeroIndexed: number;
  },
) => {
  const user = requireUser(context);
  const offset = pageZeroIndexed * pageSize;

  const query = Prisma.raw(`
    ${NOGGIN_INDEX_SELECT}
    ${NOGGIN_INDEX_PERSONAL_WHERE}
    ${NOGGIN_INDEX_PAGE_INFO}
  `);
  // @ts-expect-error wtf? this is from the prisma docs
  query.values = [user.id, pageSize, offset];

  const nogginsRaw = await prisma.$queryRaw<NogginIndexQueryType>(query);
  const noggins = reformatNogginIndex(nogginsRaw);

  await authorizeNoggins(context, noggins);

  return noggins;
};

export const loadNogginsIndexCount = async (context: AppLoadContext) => {
  const user = requireUser(context);

  const query = Prisma.raw(`
    select
      count(*)
    from "Noggin"
    ${NOGGIN_INDEX_PERSONAL_WHERE}`);

  // @ts-expect-error
  query.values = [user.id];
  const count = await prisma.$queryRaw<{ count: number }[]>(query);

  return Number(count[0].count);
};

export const loadNogginsIndexForTeam = async (
  context: AppLoadContext,
  {
    teamId,
    pageSize = 20,
    pageZeroIndexed = 0,
  }: {
    teamId: number;
    pageSize: number;
    pageZeroIndexed: number;
  },
) => {
  await requireUserMayParticipateInTeam(context, teamId);

  const offset = pageZeroIndexed * pageSize;

  const query = Prisma.raw(`
    ${NOGGIN_INDEX_SELECT}
    ${NOGGIN_INDEX_TEAM_WHERE}
    ${NOGGIN_INDEX_PAGE_INFO}
  `);
  // @ts-expect-error wtf? this is from the prisma docs
  query.values = [teamId, pageSize, offset];

  const nogginsRaw = await prisma.$queryRaw<NogginIndexQueryType>(query);
  const noggins = reformatNogginIndex(nogginsRaw);

  await authorizeNoggins(context, noggins);

  return noggins;
};

export const loadNogginIndexCountForTeam = async (
  context: AppLoadContext,
  teamId: number,
) => {
  await requireUserMayParticipateInTeam(context, teamId);

  const query = Prisma.raw(`
    select
      count(*)
    from "Noggin"
    ${NOGGIN_INDEX_TEAM_WHERE}`);

  // @ts-expect-error
  query.values = [teamId];
  const count = await prisma.$queryRaw<{ count: number }[]>(query);

  return Number(count[0].count);
};

export const getNogginEditorSchema_OMNISCIENT = async (
  nogginId: number,
): Promise<EditorSchema> => {
  const noggin = await prisma.noggin.findUniqueOrThrow({
    where: {
      id: nogginId,
    },
    select: {
      aiModel: {
        select: {
          editorSchema: true,
        },
      },
    },
  });

  // console.log('noggin.aiModel.editorSchema', noggin.aiModel.editorSchema);

  return noggin.aiModel.editorSchema as unknown as EditorSchema;
};
