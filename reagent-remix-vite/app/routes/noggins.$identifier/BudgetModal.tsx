import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useLoaderData, useParams, useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { CostText } from '~/components/CostText';
import { NogginBudgetEntry } from '~/components/NogginBudgetEntry';
import T from '~/i18n/T';
import { NogginRouteLoaderType } from './route';

type BudgetModalProps = {
  open: boolean;
  currentBudgetQuastra: number | null;
  setOpen: (open: boolean) => void;
};

export default function BudgetModal(props: BudgetModalProps) {
  const { noggin, totalIncurredCostQuastra, permittedBudgetQuastra } =
    useLoaderData<NogginRouteLoaderType>();
  // const totalIncurredCostCredits = roundedCreditCount(totalIncurredCostQuastra);

  const [chosenRadio, setChosenRadio] = useState<'limited' | 'unlimited'>(
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
      <DialogContent>
        <DialogContentText>
          {/* todo put splangs from new noggin page here */}
          {totalIncurredCostQuastra > 0 && (
            <T flagged>
              This noggin has already spent{' '}
              <CostText quastra={totalIncurredCostQuastra} />, so the budget
              must be at least that much.
            </T>
          )}
        </DialogContentText>

        <NogginBudgetEntry
          totalIncurredCostQuastra={totalIncurredCostQuastra}
          currentBudgetAmountQuastra={currentBudgetAmountQuastra}
          setCurrentBudgetAmountQuastra={setCurrentBudgetAmountQuastra}
          chosenRadio={chosenRadio}
          setChosenRadio={setChosenRadio}
          maxPermittedBudgetQuastra={permittedBudgetQuastra}
          isTeam={noggin.teamOwnerId !== null}
        />
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
