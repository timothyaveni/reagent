import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useLoaderData, useParams, useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { unit } from 'reagent-noggin-shared/cost-calculation/units';
import { CostText, roundedCreditCount } from '~/components/CostText';
import T from '~/i18n/T';
import { NogginRouteLoaderType } from './route';

type BudgetModalProps = {
  open: boolean;
  currentBudgetQuastra: number | null;
  setOpen: (open: boolean) => void;
};

export default function BudgetModal(props: BudgetModalProps) {
  const { totalIncurredCostQuastra } = useLoaderData<NogginRouteLoaderType>();
  // const totalIncurredCostCredits = roundedCreditCount(totalIncurredCostQuastra);

  const [chosenRadio, setChosenRadio] = useState(
    props.currentBudgetQuastra === null ? 'unlimited' : 'limited',
  );

  const { identifier } = useParams();
  const saveBudget = useSubmit();

  const initialBudgetAmountQuastra =
    props.currentBudgetQuastra === null
      ? totalIncurredCostQuastra
      : props.currentBudgetQuastra;

  const [currentBudgetAmountQuastra, setCurrentBudgetAmountQuastra] = useState(
    initialBudgetAmountQuastra,
  );

  const currentBudgetAmountCredits = roundedCreditCount(
    currentBudgetAmountQuastra,
  );
  const totalIncurredCostCredits = roundedCreditCount(totalIncurredCostQuastra);

  return (
    <Dialog
      open={props.open}
      onClose={() => props.setOpen(false)}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          saveBudget(
            {
              action: 'setBudget',
              budgetQuastra:
                chosenRadio === 'unlimited' ? null : currentBudgetAmountQuastra,
            },
            {
              method: 'POST',
              action: `/noggins/${identifier}`,
              navigate: false,
            },
          );
          // todo hmm looks like we can't make the next line run only after success
          props.setOpen(false);
        },
      }}
    >
      <DialogTitle>
        <T>Set noggin budget</T>
      </DialogTitle>
      {/* two options: unlimited, or a floating point number input */}
      <DialogContent>
        <DialogContentText>
          <T flagged>
            This noggin has already spent{' '}
            <CostText quastra={totalIncurredCostQuastra} />, so the budget must
            be at least that much.
          </T>
        </DialogContentText>

        <RadioGroup
          value={chosenRadio}
          onChange={(event) => {
            setChosenRadio(event.target.value);
          }}
        >
          <FormControlLabel
            value="unlimited"
            control={<Radio />}
            label={<T>Unlimited</T>}
          />
          <FormControlLabel
            value="limited"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box
                  gap={1}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography>
                    <T flagged>Limit to</T>
                  </Typography>
                  <TextField
                    type="text"
                    variant="standard"
                    inputProps={{
                      min: totalIncurredCostCredits,
                      step: 0.01,
                      sx: {
                        width: '12ch',
                      },
                    }}
                    onFocus={() => {
                      setChosenRadio('limited');
                    }}
                    value={currentBudgetAmountCredits}
                    onChange={(event) => {
                      const newParsed = parseFloat(event.target.value);

                      if (isNaN(newParsed)) {
                        return;
                      }

                      const withMin = Math.max(
                        newParsed,
                        totalIncurredCostCredits,
                      );
                      setCurrentBudgetAmountQuastra(
                        unit(withMin, 'credits').toNumber('quastra'),
                      );
                    }}
                  />
                  <T flagged>credits</T>
                </Box>
                <Typography variant="caption">
                  <T flagged>
                    <CostText
                      quastra={
                        currentBudgetAmountQuastra - totalIncurredCostQuastra
                      }
                    />{' '}
                    will remain
                  </T>
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.setOpen(false)}>Cancel</Button>
        <Button type="submit" variant="contained">
          Set budget
        </Button>
      </DialogActions>
    </Dialog>
  );
}
