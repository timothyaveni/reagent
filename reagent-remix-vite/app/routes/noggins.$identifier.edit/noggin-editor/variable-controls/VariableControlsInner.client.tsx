import { Card, Typography } from '@mui/material';
import { useSyncedStore } from '@syncedstore/react';
import { DocumentVariable } from 'reagent-noggin-shared/types/DocType';
import { uniq } from 'underscore';
import T from '~/i18n/T';
import { useEditorStore } from '../editor-utils';
import { BooleanVariableOptionControls } from './BooleanVariableOptionControls copy.js';
import { ImageVariableOptionControls } from './ImageVariableOptionControls';
import { IntegerVariableOptionControls } from './IntegerVariableOptionControls';
import { NumberVariableOptionControls } from './NumberVariableOptionControls';
import { TextVariableOptionControls } from './TextVariableOptionControls';

export function VariableControlsInner({
  documentIds,
}: {
  documentIds: string[];
}) {
  const store = useEditorStore();
  console.log('apoc rerender');
  const documentIdList: string[][] = [];
  for (const documentId of documentIds) {
    documentIdList.push(
      // eslint-disable-next-line react-hooks/rules-of-hooks i promise it's not dynamic
      useSyncedStore(store.documentParameterIdsByDocument)[documentId]!,
    );
  }

  const variableElementIds = uniq(documentIdList.flat());

  if (variableElementIds.length === 0) {
    return (
      <Card sx={{ p: 4, mt: 2 }} elevation={2}>
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          gutterBottom
        >
          <T>
            Your prompts don't contain any variables! You can add one by typing
            &ldquo;$&rdquo; into the pane to the left.
          </T>
        </Typography>
      </Card>
    );
  }

  return (
    <div className="variable-controls-wrapper">
      {variableElementIds.map((id) => (
        <VariableOptionControls key={id} id={id} />
      ))}
    </div>
  );
}
function VariableOptionControls({ id }: { id: string }) {
  const store = useEditorStore();
  const variableOptions = useSyncedStore(store.documentParameters);
  // console.log({ variableOptions: JSON.stringify(variableOptions) });
  // @ts-ignore
  const thisVariable: DocumentVariable = variableOptions[id];
  if (!thisVariable) {
    console.log('no variable options yet', id, JSON.stringify(variableOptions));
    return null; // next tick, i think
  }

  switch (thisVariable.type) {
    case 'image':
      return <ImageVariableOptionControls id={id} variable={thisVariable} />;
    case 'number':
      return <NumberVariableOptionControls id={id} variable={thisVariable} />;
    case 'integer':
      return <IntegerVariableOptionControls id={id} variable={thisVariable} />;
    case 'boolean':
      return <BooleanVariableOptionControls id={id} variable={thisVariable} />;
    case 'text':
    default: // TODO probably get rid of this -- i just didn't want to migrate my test db
      return <TextVariableOptionControls id={id} variable={thisVariable} />;
  }

  throw new Error('unknown variable type');
}
