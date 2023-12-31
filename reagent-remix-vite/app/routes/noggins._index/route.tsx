import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { requireUser } from '~/auth/auth.server';
import { loadNogginsIndex } from '~/models/noggin.server';

import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import T from '~/i18n/T';
import './NogginList.css';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  const noggins = await loadNogginsIndex(context);

  return json({ noggins });
};

// TODO type
function NogginCard({ noggin }: { noggin: any }) {
  const navigate = useNavigate();

  return (
    <div className="noggin-card" key={noggin.slug}>
      <Card variant="outlined">
        <CardActionArea
          onClick={() => navigate(`/noggins/${noggin.slug}/edit`)}
        >
          <CardContent>
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
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  );
}

export default function NogginList() {
  const { noggins } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="noggin-list">
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={6}
        mt={4}
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

      <Stack spacing={2}>
        {noggins.map((noggin) => (
          <NogginCard key={noggin.slug} noggin={noggin} />
        ))}
      </Stack>
    </div>
  );
}
