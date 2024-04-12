import { BlurOn } from '@mui/icons-material';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { requireUser } from '~/auth/auth.server';
import { loadNogginsIndex } from '~/models/noggin.server';

import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { MetaFunction } from '@remix-run/react';
import { LoaderFunctionArgs, SerializeFrom } from '@remix-run/server-runtime';
import {
  NogginRevisionOutputSchema,
  NogginRevisionVariables,
} from 'reagent-noggin-shared/types/NogginRevision';
import T from '~/i18n/T';
import NogginCardIOSchema from './NogginCardIOSchema';

export const meta: MetaFunction = () => {
  return [
    { title: 'Noggins :: reagent' },
    {
      name: 'description',
      content: 'All your noggins on reagent',
    },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  const noggins = await loadNogginsIndex(context);

  return json({ noggins });
};

type NogginIndexLoader = typeof loader;
type NogginIndexLoaderData = SerializeFrom<NogginIndexLoader>;

function NogginCard({
  noggin,
}: {
  noggin: NogginIndexLoaderData['noggins'][0];
}) {
  const navigate = useNavigate();

  return (
    <div className="noggin-card" key={noggin.slug}>
      <Card variant="outlined">
        <CardActionArea
          onClick={() => navigate(`/noggins/${noggin.slug}/edit`)}
        >
          <CardContent>
            <Stack
              direction={'row'}
              spacing={2}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Stack>
                <Typography variant="h2">{noggin.title}</Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  className="noggin-description"
                >
                  <T flagged>
                    {noggin.aiModel.modelProvider.name}/
                    <strong>{noggin.aiModel.name}</strong>
                  </T>
                </Typography>
                {noggin.parentOrg && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                    className="noggin-description"
                  >
                    {noggin.teamOwner ? (
                      <T flagged>
                        Within the team <strong>{noggin.teamOwner.name}</strong>{' '}
                        in the organization{' '}
                        <strong>{noggin.parentOrg.name}</strong>
                      </T>
                    ) : (
                      <T flagged>
                        Within the organization{' '}
                        <strong>{noggin.parentOrg.name}</strong>
                      </T>
                    )}
                  </Typography>
                )}
              </Stack>
              <NogginCardIOSchema
                variables={
                  noggin.nogginRevisions[0]
                    .nogginVariables as NogginRevisionVariables
                }
                outputSchema={
                  noggin.nogginRevisions[0]
                    .outputSchema as NogginRevisionOutputSchema
                }
              />
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  );
}

function NogginIndexDescription() {
  return (
    <Box>
      <Typography component="p" variant="body1" mb={2}>
        <T>
          <strong>Noggins</strong> are custom AI tools that you can configure
          within reagent.
        </T>
      </Typography>
      <Typography component="p" variant="body1" mb={2}>
        <T>
          You can think of a noggin as being a single-purpose
          &ldquo;brain&rdquo; or function that you design to handle one task
          particularly well. For example, you might use a noggin to
          pre-configure instructions to a language model or to get a
          text-to-image model to create drawings in a particular style.
        </T>
      </Typography>
      <Typography component="p" variant="body1" mb={2}>
        <T>
          Effectively, noggins are <em>prompt templates</em> that automatically
          become APIs you can use in your own code.
        </T>
      </Typography>
    </Box>
  );
}

function NogginIndexBody({
  noggins,
}: {
  noggins: NogginIndexLoaderData['noggins'];
}) {
  if (noggins.length === 0) {
    return (
      <Box>
        <Paper
          elevation={2}
          // don't take up the full width:
          sx={{
            width: 'fit-content',
            mx: 'auto',
            p: 3,
          }}
        >
          <Stack spacing={2} alignItems={'center'}>
            <BlurOn htmlColor="#666" fontSize="large" />
            <Typography variant="body1" color="textSecondary">
              <T>
                Looks like you don't have any noggins yet! You can add one with
                the button above.
              </T>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {noggins.map((noggin) => (
        <NogginCard key={noggin.slug} noggin={noggin} />
      ))}
    </Stack>
  );
}

export default function NogginList() {
  const { noggins } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Stack mt={4} spacing={5}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={6}
        sx={{ justifyContent: 'space-between' }}
      >
        <Typography variant="h1">
          <T>Noggins</T>
        </Typography>
        <Button
          sx={{
            textTransform: 'none',
          }}
          variant="contained"
          onClick={() => navigate('/noggins/new')}
        >
          <T>
            <Typography variant="button">+ new noggin</Typography>
          </T>
        </Button>
      </Stack>

      <NogginIndexDescription />

      <NogginIndexBody noggins={noggins} />
    </Stack>
  );
}
