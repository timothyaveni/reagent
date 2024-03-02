import { Box, Switch, Tooltip, styled } from '@mui/material';
import { useSyncedStore } from '@syncedstore/react';
import { ModelInput } from 'reagent-noggin-shared/types/editorSchemaV1';
import T from '~/i18n/T';
import { useEditorStore, useHasPopulatedStore } from './editor-utils';

// de https://mui.com/material-ui/react-switch/
const VariableSwitch = styled(Switch)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="20" font-family="Lato, sans-serif" fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}">$</text></svg>')`,
      left: 12,
    },
    //
    '&::after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" font-family="Lato, sans-serif" fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}">↓</text></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));

export function AllowOverrideForInputSelectorInner({
  inputKey,
  input,
}: {
  inputKey: string;
  input: ModelInput;
}) {
  const hasPopulatedStore = useHasPopulatedStore();
  if (!hasPopulatedStore) {
    return null;
  }

  const store = useEditorStore();
  // console.log('overridableModelInputKeys', store.overridableModelInputKeys);
  // @ts-ignore
  const isOverridableByInputKey: string[] = useSyncedStore(
    store.overridableModelInputKeys,
  );
  const isOverridable = isOverridableByInputKey.includes(inputKey);

  return (
    <Box>
      <Tooltip
        title={
          <>
            <p>
              <T>
                Expose this input as a noggin variable so it can be overridden
                by the user.
              </T>
            </p>
            <p>
              Any value you specify here will be used as the default value when
              the variable is not present.
            </p>
          </>
        }
      >
        <VariableSwitch
          checked={isOverridable}
          onChange={(event) => {
            const nowOverridable = event.target.checked;
            if (isOverridable && !nowOverridable) {
              store.overridableModelInputKeys.splice(
                store.overridableModelInputKeys.indexOf(inputKey),
                1,
              );
            } else if (!isOverridable && nowOverridable) {
              store.overridableModelInputKeys.push(inputKey);
            }
          }}
        />
      </Tooltip>
    </Box>
  );
}
