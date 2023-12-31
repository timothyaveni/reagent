import { InputBase } from '@mui/material';

export default function NogginTitleInput({
  noggin,
}: {
  noggin: any; // TODO
}) {
  return (
    <InputBase
      value={noggin.title}
      sx={{
        fontSize: '2rem',
        fontWeight: 'bold',
        borderBottom: '1px solid transparent',
        width: '100%',

        '&:hover': {
          borderBottom: '1px solid #666',
        },
      }}
    />
  );
}
