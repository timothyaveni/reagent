import {
  Box,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useLoaderData, useMatches, useNavigate } from '@remix-run/react';
import React from 'react';
import T from '~/i18n/T';
import NogginTitleInput from './NogginTitleInput';

import './EditorHeader.css';
import { NogginRouteLoaderType } from './route';

const EditorHeader: React.FC = () => {
  const { noggin } = useLoaderData<NogginRouteLoaderType>();
  const navigate = useNavigate();
  const locationMatches = useMatches();
  console.log({ locationMatches });
  const isEdit = locationMatches.some(
    (match) => match.id === 'routes/noggins.$identifier.edit',
  );
  const isUse = locationMatches.some(
    (match) =>
      match.id === 'routes/noggins.$identifier.use' ||
      match.id === 'routes/noggins.$identifier.use_.$runId', // todo hm we might change this later
  );
  const navValue = isEdit ? 'edit' : isUse ? 'use' : null;

  return (
    <div className="noggin-editor-header">
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={4}
        mt={2}
        sx={{
          justifyContent: 'space-between',

          '& hr': {},
        }}
      >
        <Box flexGrow={1}>
          <Stack>
            <NogginTitleInput noggin={noggin} />
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
          </Stack>
        </Box>

        <Divider orientation="vertical" flexItem variant="middle" />

        <Box paddingLeft={4}>
          <ToggleButtonGroup
            color="primary"
            value={navValue}
            exclusive
            onChange={(event, newValue) => {
              console.log({ event, newValue });
              if (newValue === 'edit') {
                navigate(`/noggins/${noggin.slug}/edit`);
              } else if (newValue === 'use') {
                navigate(`/noggins/${noggin.slug}/use`);
              }
            }}
          >
            <ToggleButton
              value="edit"
              sx={{
                paddingX: 4,
              }}
            >
              <T>Edit</T>
            </ToggleButton>
            <ToggleButton
              value="use"
              sx={{
                paddingX: 4,
              }}
            >
              <T>Use</T>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Stack>
    </div>
  );
};

export default EditorHeader;
