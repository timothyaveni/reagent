// this might go in the shared components directory at some point

import { Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams } from '@remix-run/react';
import { useState } from 'react';

type SingleImagePresignedInputProps = {
  name: string;
  currentUrl: string | null;
  onFinishUpload: (url: string) => any;
};

// ugh, nicked from the docs, i need an sr-only class
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export function SingleImagePresignedInput(
  props: SingleImagePresignedInputProps,
) {
  const { identifier } = useParams();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button variant="contained" component="label" disabled={loading}>
        Upload image
        <VisuallyHiddenInput
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setLoading(true);

            const extension = file.name.split('.').pop();

            const { presignedUrl, uploadUrl } = await fetch(
              `/noggins/${identifier}/getPresignedAssetUploadUrl`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  extension,
                }),
              },
            ).then((res) => res.json());

            await fetch(presignedUrl, {
              method: 'PUT',
              body: file,
            });

            setLoading(false);
            props.onFinishUpload(uploadUrl);
          }}
        />
        {props.currentUrl ? (
          <input type="hidden" name={props.name} value={props.currentUrl} />
        ) : null}
      </Button>
      <CircularProgress
        sx={{ display: loading ? 'block' : 'none' }}
        size={24}
      />
      {props.currentUrl ? (
        <img
          src={props.currentUrl}
          alt="Uploaded image"
          style={{ maxHeight: 24 }}
        />
      ) : null}
    </>
  );
}
