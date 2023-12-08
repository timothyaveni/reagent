import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ParameterNode } from './editor-types';
import { debounce } from 'underscore';


export const getParameterElements = (editor: ReactEditor) => {
  return [...Node.nodes(editor)]
    .filter(([node, path]: [any, number[]]) => {
      return node.type === 'parameter';
    })
    .map(([node, path]: [any, number[]]) => {
      return node as ParameterNode;
    });
};

export const addNewParameter = (editor: ReactEditor) => {
  const existingParameters = getParameterElements(editor);
  let newIndex = existingParameters.length + 1;
  while (existingParameters.some((p) => p.parameterName === `param${newIndex}`)) {
    newIndex++;
  }

  Transforms.insertNodes(editor, {
    type: 'parameter',
    parameterName: `param${newIndex}`,
    children: [{ text: '' }],
    parameterOptions: {
      maxLength: 500,
    },
  } as ParameterNode);

  Transforms.move(editor);
};

const save = async (value: any) => {
  const totalState = {
    editorValue: value,
  };

  console.log('saving', totalState);

  await fetch('http://localhost:2348/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(totalState),
  });
};
export const debouncedSave = debounce(save, 1000);

