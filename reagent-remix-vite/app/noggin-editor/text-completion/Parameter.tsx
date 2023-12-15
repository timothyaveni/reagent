import { useSyncedStore } from '@syncedstore/react';
import { useSelected } from 'slate-react';
import { store } from './store';

export const Parameter = ({
  attributes, children, element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
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
