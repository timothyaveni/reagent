import { Edit as EditIcon } from '@mui/icons-material';
import {
  Box,
  Divider,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useLoaderData, useMatches, useNavigate } from '@remix-run/react';
import React from 'react';
import T from '~/i18n/T';
import NogginTitleInput from './NogginTitleInput';

import { CostText } from '~/components/CostText';
import BudgetModal from './BudgetModal';
import './EditorHeader.css';
import { NogginRouteLoaderType } from './route';

const EditorHeader: React.FC = () => {
  const { noggin, totalIncurredCostQuastra, totalAllocatedCreditQuastra } =
    useLoaderData<NogginRouteLoaderType>();

  const [isShowingBudgetModal, setIsShowingBudgetModal] = React.useState(false);

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
            <Stack direction="row" spacing={2} alignItems="center">
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
              <Typography variant="body2" color="textSecondary" component="p">
                <T flagged>
                  <CostText quastra={totalIncurredCostQuastra} /> spent
                </T>
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                display="flex"
                alignItems="center"
                gap={1}
              >
                {totalAllocatedCreditQuastra === null ? (
                  <T>unlimited budget</T>
                ) : (
                  <T flagged>
                    <CostText quastra={totalAllocatedCreditQuastra} /> budgeted
                  </T>
                )}

                <Box
                  onClick={() => {
                    setIsShowingBudgetModal(true);
                  }}
                >
                  <IconButton>
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                <BudgetModal
                  open={isShowingBudgetModal}
                  setOpen={(open: boolean) => {
                    setIsShowingBudgetModal(open);
                  }}
                  currentBudgetQuastra={totalAllocatedCreditQuastra}
                />
              </Typography>
            </Stack>
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
