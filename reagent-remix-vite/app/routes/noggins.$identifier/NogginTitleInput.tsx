import { InputBase } from '@mui/material';
import { useParams, useSubmit } from '@remix-run/react';
import { useState } from 'react';

export default function NogginTitleInput({
  noggin,
}: {
  noggin: any; // TODO
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [shownTitle, setShownTitle] = useState<string>(noggin.title);
  const { identifier } = useParams();
  const saveTitle = useSubmit();

  return (
    <InputBase
      value={shownTitle}
      onChange={(event) => setShownTitle(event.target.value)}
      onFocus={() => {
        setIsEditingTitle(true);
      }}
      // TODO -- don't even render an editor if we don't have permission to
      onBlur={() => {
        if (shownTitle === noggin.title) {
          setIsEditingTitle(false);
          return;
        }

        saveTitle(
          {
            action: 'saveTitle',
            newTitle: shownTitle,
          },
          {
            method: 'POST',
            action: `/noggins/${identifier}`,
            navigate: false,
          },
        );
        setIsEditingTitle(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      sx={{
        fontSize: '2rem',
        fontWeight: 700,
        color: '#111',
        // @ts-ignore TS bug #46463
        borderBottom: '1px solid transparent',
        width: '100%',

        ...(isEditingTitle
          ? {
              borderBottom: '1px solid #333',
            }
          : {
              '&:hover': {
                borderBottom: '1px solid #ddd',
              },
            }),
      }}
    />
  );
}
