import { Skeleton, Typography } from '@mui/material';
import { createContext } from 'react';
import T from '~/i18n/T';
import { useHasPopulatedStore } from '../editor-utils';
import { VariableControlsInner } from './VariableControlsInner.client';

type Props = {
  // for now this is a prop, but it won't actually change throughout the lifetime of the app
  // (i'm making the call now that changing the model/schema will require at least a page reload, at least for v0)
  // what this means is that we can safely use this as a way to call into hooks, but we might get in trouble with a linter
  documentIds: string[];
  anyImagesPermitted: boolean;
};

// this drilling was sucking so i put the stop to it here. best spot? idk, editor schema maybe should be in wider ctx
export const AnyImagesPermittedContext = createContext<boolean>(false);

export const AllVariableOptionControls = (props: Props) => {
  return (
    <div>
      <Typography variant="h2" gutterBottom>
        <T>Noggin variables</T>
      </Typography>
      <Typography
        variant="body2"
        component="p"
        color="textSecondary"
        gutterBottom
      >
        <T>
          These variables can be used in text prompts. When using the noggin,
          you can provide values for these variables, and they will be inserted
          into the text prompts you write here.
        </T>
      </Typography>
      <AnyImagesPermittedContext.Provider value={props.anyImagesPermitted}>
        <ControlsWrapper documentIds={props.documentIds} />
      </AnyImagesPermittedContext.Provider>
    </div>
  );
};

function ControlsWrapper({ documentIds }: { documentIds: string[] }) {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    return <Skeleton variant="rounded" height={200} />;
  }

  return <VariableControlsInner documentIds={documentIds} />;
}
