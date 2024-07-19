import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useEffect, useRef } from 'react';
import { unit } from 'reagent-noggin-shared/cost-calculation/units';
import { CostText, roundedCreditCount } from '~/components/CostText';
import T from '~/i18n/T';
import {
  TextFieldWithSuspendedEvaluation,
  validateNotNaN,
} from './TextFieldWithSuspendedEvaluation.js';

type NogginBudgetEntryProps = {
  totalIncurredCostQuastra: number;
  currentBudgetAmountQuastra: number;
  setCurrentBudgetAmountQuastra: (amount: number) => void;

  chosenRadio: 'limited' | 'unlimited';
  setChosenRadio: (radio: 'limited' | 'unlimited') => void;

  maxPermittedBudgetQuastra: number | null;

  isTeam: boolean;
};

/* two options: unlimited, or a floating point number input */
export function NogginBudgetEntry({
  totalIncurredCostQuastra,
  currentBudgetAmountQuastra,
  setCurrentBudgetAmountQuastra,
  chosenRadio,
  setChosenRadio,
  maxPermittedBudgetQuastra,
  isTeam, // hate prop drilling for i18n/strings :/
}: NogginBudgetEntryProps) {
  const currentBudgetAmountCredits = roundedCreditCount(
    currentBudgetAmountQuastra,
  );
  const totalIncurredCostCredits = roundedCreditCount(totalIncurredCostQuastra);

  const allowUnlimited = maxPermittedBudgetQuastra === null;

  const creditsToClampedCredits = (credits: number) => {
    const withMin = Math.max(credits, totalIncurredCostCredits);
    const withMinQuastra = unit(withMin, 'credits').toNumber('quastra');

    let withMaxQuastra;
    if (maxPermittedBudgetQuastra === null) {
      withMaxQuastra = withMinQuastra;
    } else {
      withMaxQuastra = Math.min(withMinQuastra, maxPermittedBudgetQuastra);
    }

    const returnCredits = roundedCreditCount(withMaxQuastra);

    return returnCredits;
  };

  const creditsToQuastra = (credits: number) => {
    return Math.round(unit(credits, 'credits').toNumber('quastra'));
  };

  const lastMax = useRef(maxPermittedBudgetQuastra);
  const lastMin = useRef(totalIncurredCostQuastra);
  useEffect(() => {
    if (
      lastMax.current !== maxPermittedBudgetQuastra ||
      lastMin.current !== totalIncurredCostQuastra
    ) {
      lastMax.current = maxPermittedBudgetQuastra;
      lastMin.current = totalIncurredCostQuastra;

      const clampedQ = creditsToQuastra(
        creditsToClampedCredits(currentBudgetAmountCredits),
      );
      if (clampedQ !== currentBudgetAmountQuastra) {
        setCurrentBudgetAmountQuastra(clampedQ);
      }
    }
  }, [
    currentBudgetAmountQuastra,
    setCurrentBudgetAmountQuastra,
    totalIncurredCostQuastra,
    maxPermittedBudgetQuastra,
  ]);

  return (
    <RadioGroup
      value={chosenRadio}
      onChange={(event) => {
        setChosenRadio(event.target.value as 'limited' | 'unlimited');
      }}
    >
      <FormControlLabel
        value="unlimited"
        control={
          <Radio
            sx={{
              alignSelf: 'flex-start',
            }}
          />
        }
        label={
          <div>
            <Typography gutterBottom>
              <T>Unlimited</T>
            </Typography>
            {!allowUnlimited && (
              <Typography variant="caption">
                {isTeam ? (
                  <T>
                    Because this noggin is part of an organization and your team
                    has a total budget limit, you cannot set an unlimited budget
                    for this noggin.
                  </T>
                ) : (
                  <T>
                    Because this noggin is part of an organization and you have
                    a total budget limit, you cannot set an unlimited budget for
                    this noggin.
                  </T>
                )}
              </Typography>
            )}
          </div>
        }
        disabled={!allowUnlimited}
      />
      <FormControlLabel
        value="limited"
        control={
          <Radio
            sx={{
              alignSelf: 'flex-start',
            }}
          />
        }
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
              <TextFieldWithSuspendedEvaluation
                type="text"
                variant="standard"
                inputProps={{
                  step: 0.01,
                  sx: {
                    width: '12ch',
                  },
                }}
                onFocus={() => {
                  // TODO: this is in the tabindex, which makes it really hard to tab to the submit button
                  setChosenRadio('limited');
                }}
                value={currentBudgetAmountCredits}
                onChange={(validCredits: number) => {
                  setCurrentBudgetAmountQuastra(creditsToQuastra(validCredits));
                }}
                parse={(value) => parseFloat(value)}
                validations={[
                  validateNotNaN(totalIncurredCostCredits),
                  creditsToClampedCredits,
                ]}
              />
              <T flagged>credits</T>
            </Box>
            {totalIncurredCostCredits > 0 && (
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
            )}
            {maxPermittedBudgetQuastra !== null && (
              <Typography variant="caption">
                {isTeam ? (
                  <T flagged>
                    Remaining permitted budget for this team:{' '}
                    <CostText quastra={maxPermittedBudgetQuastra} />
                  </T>
                ) : (
                  <T flagged>
                    Remaining permitted budget from your organization:{' '}
                    <CostText quastra={maxPermittedBudgetQuastra} />
                  </T>
                )}
              </Typography>
            )}
          </Box>
        }
      />
    </RadioGroup>
  );
}
