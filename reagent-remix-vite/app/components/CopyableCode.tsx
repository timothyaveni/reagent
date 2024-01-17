import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { Box, ButtonBase } from '@mui/material';

// nicked this from the url param thing .. can't actually use it there though bc the copy is different. could refactor
export default function CopyableCode({ text }: { text: string }) {
  return (
    <Box
      sx={{
        position: 'relative',
        '.MuiButtonBase-root': {
          opacity: 0,
          transition: 'opacity 0.1s',
        },
        '&:hover .MuiButtonBase-root': {
          opacity: 1,
        },
        mt: 2,
        padding: 2,
        border: '1px solid #ddd',
        borderRadius: '3px',
        backgroundColor: 'rgba(240, 240, 240, 0.8)',
        fontFamily: '"Roboto Mono", monospace',
        fontSize: '10pt',
        whiteSpace: 'pre-wrap',
      }}
    >
      <ButtonBase
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          padding: 1,
          borderRadius: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid #ddd',
        }}
        onClick={() => {
          navigator.clipboard.writeText(text);
        }}
      >
        <ContentCopyIcon color="primary" />
      </ButtonBase>
      {text}
    </Box>
  );
}
