import { Paper, Stack, Typography } from '@mui/material';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { ActionFunctionArgs, json } from '@remix-run/server-runtime';
import * as QRCode from 'qrcode.react'; // weird, docs say it's esm
import { useEffect, useState } from 'react';
import { loadProvisionalNoggin } from '~/models/noggin.server.js';

export const loader = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const { provisionalNogginId } = params;

  const provisionalNoggin = await loadProvisionalNoggin(context, {
    id: parseInt(provisionalNogginId || '', 10),
  });

  return json({
    id: provisionalNoggin.id,
    linkingCode: provisionalNoggin.linkingCode,
  });
};

export default function LinkNoggin() {
  const { id, linkingCode } = useLoaderData<typeof loader>();
  const [showQRCode, setShowQRCode] = useState(false);
  const navigate = useNavigate();

  const linkingCodeWithUrl = `${
    import.meta.env.VITE_REAGENT_EXTERNAL_URL
  }/link-noggin-external/${id}?code=${linkingCode}`;

  useEffect(() => {
    // breaks in ssr /shrug
    setShowQRCode(true);
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      fetch(`/noggins/link/${id}/conversion-check`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'READY') {
            clearInterval(interval);
            navigate(data.redirect);
          }
        });
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <Stack
      spacing={2}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h4">
        Scan this code with a reagent-enabled app to finish creating this
        noggin.
      </Typography>
      <Paper
        sx={{
          width: 400,
          height: 400,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        elevation={2}
      >
        {showQRCode && (
          <QRCode.QRCodeSVG value={linkingCodeWithUrl} size={340} />
        )}
      </Paper>
    </Stack>
  );
}
