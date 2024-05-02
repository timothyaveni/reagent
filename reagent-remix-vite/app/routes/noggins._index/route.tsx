import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  loadNogginsIndex,
  loadNogginsIndexCount,
} from '~/models/noggin.server';

import { Box, Button, Stack, Typography } from '@mui/material';
import { MetaFunction } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import T from '~/i18n/T';
import { NogginIndexBody } from './NogginIndexBody';

export const meta: MetaFunction = () => {
  return [
    { title: 'Noggins :: reagent' },
    {
      name: 'description',
      content: 'All your noggins on reagent',
    },
  ];
};

const PAGE_SIZE = 20;

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')?.toString() || '1', 10) || 1;

  const [count, noggins] = await Promise.all([
    loadNogginsIndexCount(context),
    loadNogginsIndex(context, {
      pageSize: PAGE_SIZE,
      pageZeroIndexed: page - 1,
    }),
  ]);

  return json({ count, page, noggins });
};

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

export default function NogginList() {
  const { count, page, noggins } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const pageCount = Math.ceil(count / PAGE_SIZE);

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

      <NogginIndexBody
        noggins={noggins}
        page={page}
        pageCount={pageCount}
        emptyMessage={
          <T>
            Looks like you don't have any noggins yet! You can add one with the
            button above.
          </T>
        }
      />
    </Stack>
  );
}
