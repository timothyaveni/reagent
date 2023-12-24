import { useCallback } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSelected, useSlate } from 'slate-react';

export const InlineImage = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const selected = useSelected();

  return children; // todo on all of this. let's just start with image parameters, those are more useful anyway

  // const editor = useSlate() as ReactEditor; // i really think this will work...

  // return (
  //   <div {...attributes} className="inline-image" contentEditable={false}>
  //     <img src={} />
  //     {children}
  //   </div>
  // );
};
