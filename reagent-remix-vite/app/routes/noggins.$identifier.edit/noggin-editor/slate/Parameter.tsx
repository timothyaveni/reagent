import { useSyncedStore } from '@syncedstore/react';
import { useSelected } from 'slate-react';
import { useEditorStore } from '../editor-utils';

// image icon
import ImageIcon from '@mui/icons-material/Image';
import { DocumentParameter } from 'reagent-noggin-shared/types/DocType';

export const Parameter = ({
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
  const parameter: DocumentParameter = useSyncedStore(store.documentParameters)[
    element.parameterId
  ];

  // todo: somewhere we need to inform the user or prevent them from putting image parameters in the assistant text
  return (
    <span
      {...attributes}
      className={'parameter' + (selected ? ' selected' : '')}
      contentEditable={false}
    >
      {/* {element.parameterOptions.name} */}
      {/* todo workshop this a bit lol */}
      {parameter.type === 'image' ? <ImageIcon fontSize="small" /> : null}
      {parameter.name}
      {children}
    </span>
  );
};
