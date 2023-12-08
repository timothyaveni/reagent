import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { ParameterNode } from './editor-types';
import { getParameterElements } from './editor-utils';

export const ParameterOptionControls = () => {
  const editor = useSlate() as ReactEditor;
  // todo we can bring this into a hook to make it more efficient, probably... and debounce it
  const parameterElements = getParameterElements(editor);

  return (
    <div>
      <h3>Parameter Options</h3>
      {parameterElements.map((element, i) => {
        return (
          <div
            key={i} // always a little rough to use the index but there's no id, and using the name means the text field unfocuses when you change it
            className="parameter-control"
            style={{
              border: '1px solid #ccc',
              padding: 10,
              marginBottom: 10,
            }}
          >
            <input
              type="text"
              className="parameter-name-input"
              value={element.parameterName}
              onChange={(event) => {
                const path = ReactEditor.findPath(editor, element);
                const update: Partial<ParameterNode> = {
                  parameterName: event.target.value,
                };
                Transforms.setNodes(editor, update, { at: path });
              }} />
            <br />
            Max length:{' '}
            <input
              type="number"
              className="parameter-max-length-input"
              value={element.parameterOptions.maxLength}
              onChange={(event) => {
                const path = ReactEditor.findPath(editor, element);
                const update: Partial<ParameterNode> = {
                  parameterOptions: {
                    maxLength: parseInt(event.target.value),
                  },
                };
                Transforms.setNodes(editor, update, { at: path });
              }} />
          </div>
        );
      })}
    </div>
  );
};
