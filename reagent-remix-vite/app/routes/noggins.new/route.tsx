import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData, useSearchParams } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import { createNoggin, createProvisionalNoggin } from '~/models/noggin.server';
import {
  getEnabledAIModelIDsForOrganization,
  getPermittedAdditionalBudgetForOrganizationAndOwner,
  indexOrganizations,
} from '~/models/organization.server';

import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
import { useState } from 'react';
import { unit } from 'reagent-noggin-shared/cost-calculation/units';
import { NogginBudgetEntry } from '~/components/NogginBudgetEntry';
import T, { t } from '~/i18n/T';
import { indexAIModels } from '~/models/aiModel.server';
import { getAllTeamsForUser } from '~/models/team.server.js';

import { groupBy } from 'underscore';
import { notFound } from '~/route-utils/status-code.js';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Create a noggin :: reagent` },
    {
      name: 'description',
      content: `Create a new noggin`,
    },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const orgs = await indexOrganizations(context);
  const teams = await getAllTeamsForUser(context);

  // joins are for losers
  const permittedAdditionalIndividualSpend = await Promise.all(
    orgs.map((org) =>
      getPermittedAdditionalBudgetForOrganizationAndOwner(context, {
        organizationId: org.id,
        teamOwnerId: null,
      }),
    ),
  );
  const permittedAdditionalTeamSpend = await Promise.all(
    teams.map((team) =>
      getPermittedAdditionalBudgetForOrganizationAndOwner(context, {
        organizationId: team.organizationId,
        teamOwnerId: team.id,
      }),
    ),
  );
  const permittedAdditionalSpendByOrgId = Object.fromEntries(
    orgs.map((org, i) => [org.id, permittedAdditionalIndividualSpend[i]]),
  );
  const permittedAdditionalSpendByTeamId = Object.fromEntries(
    teams.map((team, i) => [team.id, permittedAdditionalTeamSpend[i]]),
  );

  const aiModels = await indexAIModels(context);

  // choose your fighter
  const enabledModelsForOrgs = Object.fromEntries(
    await Promise.all(
      orgs.map(async (org) => {
        return [
          org.id,
          await getEnabledAIModelIDsForOrganization(context, {
            organizationId: org.id,
          }),
        ];
      }),
    ),
  );

  return json({
    orgs,
    teams,
    permittedAdditionalSpendByOrgId,
    permittedAdditionalSpendByTeamId,
    aiModels,
    enabledModelsForOrgs,
  });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const user = requireUser(context);

  const formData = await request.formData();

  const name = formData.get('name')?.toString();

  if (name === undefined || name === '') {
    throw new Error('name is required');
  }

  const budgetQuastraString = formData.get('budgetQuastra')?.toString();

  let budgetQuastra: bigint | null = null;
  if (budgetQuastraString && budgetQuastraString !== 'null') {
    budgetQuastra = BigInt(Math.round(parseFloat(budgetQuastraString)));
  }

  const orgControl = formData.get('org-control')?.toString() || 'personal';
  let nogginOrgOwner: number | null = null;

  if (orgControl !== null && orgControl !== 'personal') {
    nogginOrgOwner = parseInt(orgControl, 10);
  }

  let ownerData: {
    ownerType: 'user' | 'team';
    ownerId: number;
  } = {
    ownerType: 'user',
    ownerId: user.id,
  };

  const teamId = formData.get('teamId')?.toString();
  const teamIdInt = parseInt(teamId || '', 10);
  if (!isNaN(teamIdInt)) {
    ownerData = {
      ownerType: 'team',
      ownerId: teamIdInt,
    };
  }

  const action = formData.get('action')?.toString();

  if (action === 'create') {
    const aiModelIdString = formData.get('aiModelId')?.toString();
    if (!aiModelIdString) {
      throw new Error('aiModelId is required');
    }

    const aiModelId = parseInt(aiModelIdString, 10);

    const noggin = await createNoggin(context, {
      ...ownerData,
      containingOrganizationId: nogginOrgOwner,
      aiModelId,
      name,
      budgetQuastra,
    });

    return redirect(`/noggins/${noggin.slug}/edit`);
  } else if (action === 'createProvisional') {
    const provisionalNoggin = await createProvisionalNoggin(context, {
      ...ownerData,
      containingOrganizationId: nogginOrgOwner,
      name,
      budgetQuastra,
    });

    return redirect(`/noggins/link/${provisionalNoggin.id}`);
  }

  return notFound();
};

export default function NewNoggin() {
  const {
    orgs,
    teams,
    permittedAdditionalSpendByOrgId,
    permittedAdditionalSpendByTeamId,
    aiModels,
    enabledModelsForOrgs,
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const createLinked = !!searchParams.get('createLinked');

  const teamsByOrgId = groupBy(teams, 'organizationId');

  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [nogginOrgOwner, setNogginOrgOwner] = useState<number | null>(null);

  const filteredAIModelOptions = aiModels.filter((model) => {
    if (nogginOrgOwner === null) {
      return true;
    }

    const enabledModelIds = enabledModelsForOrgs[nogginOrgOwner];
    return enabledModelIds.includes(model.id);
  });

  const [preliminaryTeamId, setPreliminaryTeamId] = useState<number | null>(
    null,
  );
  const orgOwnsTeam = (teamId: number | null) => {
    if (teamId === null) {
      return false;
    }

    return (
      teams.find((team) => team.id === teamId)?.organizationId ===
      nogginOrgOwner
    );
  };
  const trueTeamId =
    preliminaryTeamId && orgOwnsTeam(preliminaryTeamId)
      ? preliminaryTeamId
      : null;

  const [chosenBudgetRadio, setChosenBudgetRadio] = useState<
    'limited' | 'unlimited'
  >('limited');

  // const { identifier } = useParams();
  // const saveBudget = useSubmit();

  const [currentBudgetAmountQuastra, setCurrentBudgetAmountQuastra] = useState(
    unit(15, 'credits').toNumber('quastra'),
  );

  const [nogginName, setNogginName] = useState<string>('');

  const finalButtonEnabled = createLinked
    ? nogginName !== ''
    : nogginName !== '' && selectedModelId !== null;

  const permittedAdditionalSpend =
    nogginOrgOwner === null
      ? null
      : trueTeamId !== null
      ? permittedAdditionalSpendByTeamId[trueTeamId]
      : permittedAdditionalSpendByOrgId[nogginOrgOwner];

  return (
    <div className="new-noggin">
      <Typography variant="h1" mb={4}>
        <T>Create a noggin</T>
      </Typography>

      <Form method="post">
        <Box
          sx={{
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          <Stack spacing={2}>
            <Paper
              sx={{
                p: 4,
              }}
            >
              <Stack spacing={2}>
                <TextField
                  name="name"
                  label={t('Noggin name')}
                  value={nogginName}
                  onChange={(e) => setNogginName(e.target.value)}
                />

                {orgs.length > 0 && (
                  <FormControl>
                    <FormLabel id="org-control-label">
                      <Typography variant="h3" color="textPrimary" gutterBottom>
                        <T>Organization</T>
                      </Typography>
                      <Typography variant="body1" color="textPrimary">
                        <T flagged>
                          Create this noggin within an{' '}
                          <strong>organization</strong>?
                        </T>
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        <T>
                          Creating a noggin within an organization gives full
                          edit access to organization managers, and also causes
                          the noggin to be paid for by the organization.
                        </T>
                      </Typography>
                    </FormLabel>
                    <RadioGroup
                      name="org-control"
                      aria-labelledby="org-control-label"
                      value={
                        nogginOrgOwner === null
                          ? 'personal'
                          : nogginOrgOwner.toString()
                      }
                      onChange={(e) => {
                        if (e.target.value === 'personal') {
                          setNogginOrgOwner(null);
                        } else {
                          setNogginOrgOwner(parseInt(e.target.value, 10));
                        }
                      }}
                    >
                      <FormControlLabel
                        value="personal"
                        control={<Radio />}
                        label={<T>No, make this a personal noggin</T>}
                      />
                      {orgs.map((org) => (
                        <FormControlLabel
                          key={org.id}
                          value={org.id.toString()}
                          control={<Radio />}
                          label={
                            <T flagged>
                              Create a noggin owned by{' '}
                              <strong>{org.name}</strong>
                            </T>
                          }
                          onChange={(e) => {
                            setNogginOrgOwner(org.id);
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}

                {nogginOrgOwner !== null &&
                  teamsByOrgId[nogginOrgOwner]?.length && (
                    <FormControl>
                      <FormLabel id="org-control-label">
                        <Typography
                          variant="h3"
                          color="textPrimary"
                          gutterBottom
                        >
                          <T>Team</T>
                        </Typography>
                        <Typography variant="body1" color="textPrimary">
                          <T flagged>
                            Create this noggin for a <strong>team</strong>{' '}
                            you're in?
                          </T>
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          <T>
                            Creating a noggin for a team gives full edit access
                            to fellow team members, and the noggin will be
                            billed against the team budget, which is separate
                            from any individual's budget.
                          </T>
                        </Typography>
                      </FormLabel>

                      <RadioGroup
                        aria-labelledby="team-control-label"
                        value={
                          trueTeamId === null
                            ? 'individual'
                            : trueTeamId.toString()
                        }
                        onChange={(e) => {
                          setPreliminaryTeamId(
                            e.target.value === 'individual'
                              ? null
                              : parseInt(e.target.value, 10),
                          );
                        }}
                      >
                        <FormControlLabel
                          value="individual"
                          control={<Radio />}
                          label={
                            <T flagged>
                              No, make this an individual noggin within{' '}
                              <strong>
                                {
                                  orgs.find((org) => org.id === nogginOrgOwner)
                                    ?.name
                                }
                              </strong>
                            </T>
                          }
                        />
                        {teamsByOrgId[nogginOrgOwner].map((team) => (
                          <FormControlLabel
                            key={team.id}
                            value={team.id.toString()}
                            control={<Radio />}
                            label={
                              <T flagged>
                                Create for my team <strong>{team.name}</strong>
                              </T>
                            }
                          />
                        ))}
                      </RadioGroup>
                      <input
                        type="hidden"
                        name="teamId"
                        value={JSON.stringify(trueTeamId)}
                      />
                    </FormControl>
                  )}

                {createLinked ? null : (
                  <>
                    <Typography variant="h3" color="textPrimary" gutterBottom>
                      <T>Choose a model</T>
                    </Typography>
                    <Autocomplete
                      options={filteredAIModelOptions}
                      getOptionLabel={(option) =>
                        `${option.modelProvider.name}/${option.name}`
                      }
                      renderInput={(params) => (
                        <TextField {...params} label={t('AI Model')} />
                      )}
                      onChange={(e, value) => {
                        setSelectedModelId(value?.id ?? null);
                      }}
                      value={
                        filteredAIModelOptions.find(
                          (model) => model.id === selectedModelId,
                        ) ?? null
                      }
                    />
                    <input
                      type="hidden"
                      name="aiModelId"
                      value={selectedModelId ?? ''}
                    />
                  </>
                )}

                <Typography variant="h3" color="textPrimary" gutterBottom>
                  <T>Noggin budget</T>
                </Typography>
                <Typography variant="body1" color="textPrimary">
                  <T>
                    How many credits can the noggin spend before it stops
                    running? It's good to keep this low while you're testing, to
                    make sure an infinite loop in your code doesn't spend a
                    bunch of money.
                  </T>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <T>100 credits = $1.00 USD.</T>
                </Typography>

                <NogginBudgetEntry
                  totalIncurredCostQuastra={0}
                  currentBudgetAmountQuastra={currentBudgetAmountQuastra}
                  setCurrentBudgetAmountQuastra={setCurrentBudgetAmountQuastra}
                  chosenRadio={chosenBudgetRadio}
                  setChosenRadio={setChosenBudgetRadio}
                  maxPermittedBudgetQuastra={permittedAdditionalSpend}
                  isTeam={trueTeamId !== null}
                />
                <input
                  type="hidden"
                  name="budgetQuastra"
                  value={
                    chosenBudgetRadio === 'unlimited'
                      ? 'null'
                      : currentBudgetAmountQuastra
                  }
                />
              </Stack>
            </Paper>
            <Box
              alignSelf="flex-end"
              sx={{
                display: 'formState === "initial" ? "block" : "none"',
              }}
            >
              {createLinked ? (
                <>
                  <input
                    type="hidden"
                    name="action"
                    value="createProvisional"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!finalButtonEnabled}
                  >
                    Link to application
                  </Button>
                </>
              ) : (
                <>
                  <input type="hidden" name="action" value="create" />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!finalButtonEnabled}
                  >
                    Create
                  </Button>
                </>
              )}
            </Box>
          </Stack>
        </Box>
      </Form>
    </div>
  );
}
