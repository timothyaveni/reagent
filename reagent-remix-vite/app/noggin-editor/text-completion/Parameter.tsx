import { useSyncedStore } from '@syncedstore/react';
import { useContext } from 'react';
import { useSelected } from 'slate-react';
import { StoreContext } from './Editor.client';
import { useEditorStore } from './editor-utils';

export const Parameter = ({
  attributes, children, element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const store = useEditorStore();
  const selected = useSelected();

  // @ts-ignore
  const parameterName = useSyncedStore(store.documentParameters)[element.parameterId]?.name;

  return (
    <span
      {...attributes}
      className={'parameter' + (selected ? ' selected' : '')}
      contentEditable={false}
    >
      {/* {element.parameterOptions.name} */}
      {parameterName}
      {children}
    </span>
  );
};
