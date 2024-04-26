import { AppLoadContext } from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import prisma from '~/db';
import { createInitialRevisionForNoggin_OMNIPOTENT } from './nogginRevision.server';

import { EditorSchema } from 'reagent-noggin-shared/types/editorSchema';
import {
  NumberDictionary,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';
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

  // there is a race condition of course but the database has a uniqueness constraint. user will live
  const slug = await generateFreeSlug();

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

    const modelEnabled = await isModelEnabledForOrganization(context, {
      organizationId: containingOrganizationId,
      modelId: nogginData.aiModelId,
    });

    if (!modelEnabled) {
      throw new Error('Model not enabled for organization');
    }
  }

  const noggin = await prisma.noggin.create({
    data: {
      slug,
      title: nogginData.name || slug,
      aiModel: { connect: { id: nogginData.aiModelId } },
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
      ...(containingOrganizationId !== null
        ? {
            parentOrg: { connect: { id: containingOrganizationId } },
          }
        : {}),
      totalAllocatedCreditQuastra: nogginData.budgetQuastra,
    },
  });

  await createInitialRevisionForNoggin_OMNIPOTENT(noggin.id);

  return noggin;
};

export const randomSlug = () => {
  const numberDictionary = NumberDictionary.generate({ min: 1000, max: 9999 });
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals, numberDictionary],
    length: 3,
    separator: '-',
    style: 'lowerCase',
  });
};

export const generateFreeSlug = async () => {
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

export const loadNogginsIndex = async (context: AppLoadContext) => {
  const user = requireUser(context);

  const nogginsRaw = (await prisma.$queryRaw`
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
      "NogginRevision"."outputSchema" as "latestNogginRevisionOutputSchema"
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
    where
      (
        "Noggin"."userOwnerId" = ${user.id}
      ) or (
        "Noggin"."teamOwnerId" in (
          select
            "Team"."id"
          from "Team"
          inner join "_TeamToUser" on "Team"."id" = "_TeamToUser"."A"
          where
            "_TeamToUser"."B" = ${user.id}
        )
      )
    order by "NogginRevision"."updatedAt" desc
    -- limit 10
  `) as {
    id: number;
    slug: string;
    title: string;
    aiModelName: string;
    modelProviderName: string;
    parentOrgName: string;
    teamOwnerName: string;
    latestNogginRevisionUpdatedAt: Date;
    latestNogginRevisionId: number;
    latestNogginRevisionNogginVariables: string;
    latestNogginRevisionOutputSchema: string;
  }[];

  // reformat to how prisma would return it if we didn't need to query raw

  const noggins = nogginsRaw.map((noggin) => {
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
    };
  });

  // double check auth for each noggin -- at least while we test this refactor
  // this will just hard error if it fails, which is spooky but not as spooky as a privacy sev!
  await Promise.all(
    noggins.map((noggin) =>
      authorizeNoggin(context, {
        nogginId: noggin.id,
      }),
    ),
  );

  return noggins;
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
