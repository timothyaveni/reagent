import { useSyncedStore } from '@syncedstore/react';
import { useSelected } from 'slate-react';
import { useEditorStore } from '../editor-utils';

// image icon
import ImageIcon from '@mui/icons-material/Image';
import { DocumentVariable } from 'reagent-noggin-shared/types/DocType';

export const Variable = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const store = useEditorStore();
  const selected = useSelected();

  // @ts-ignore
  const variable: DocumentVariable = useSyncedStore(store.documentParameters)[
    element.parameterId
  ];

  // todo: somewhere we need to inform the user or prevent them from putting image parameters in the assistant text
  return (
    <span
      {...attributes}
      className={'variable' + (selected ? ' selected' : '')}
      contentEditable={false}
    >
      {/* {element.parameterOptions.name} */}
      {/* todo workshop this a bit lol */}
      {variable.type === 'image' ? (
        <ImageIcon fontSize="small" sx={{ pr: 0.5 }} />
      ) : null}
      <span style={{ opacity: 1, paddingRight: 0 }}>$</span>
      {variable.name}
      {children}
    </span>
  );
};
