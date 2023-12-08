import { useSelected } from 'slate-react';

export const Parameter = ({
  attributes, children, element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const selected = useSelected();

  return (
    <span
      {...attributes}
      className={'parameter' + (selected ? ' selected' : '')}
      contentEditable={false}
    >
      {element.parameterName}
      {children}
    </span>
  );
};
