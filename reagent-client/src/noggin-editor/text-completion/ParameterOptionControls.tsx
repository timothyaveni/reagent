import { useSyncedStore } from '@syncedstore/react';
import { store } from './store';

export const AllParameterOptionControls = () => {
  console.log('apoc rerender');
  const parameterElementIds = useSyncedStore(store.documentParameterIds);

  return (
    <div>
      <h3>Parameter Options</h3>
      {parameterElementIds.map((id) => {
        return <ParameterOptionControls id={id} key={id} />;
      })}
    </div>
  );
};

function ParameterOptionControls({ id }: { id: string }) {
  const parameterOptions = useSyncedStore(store.documentParameters);
  if (!parameterOptions[id]) {
    console.log('no parameter options yet', id, JSON.stringify(parameterOptions));
    return null; // next tick, i think
  }

  const thisParameter = parameterOptions[id];

  return (
    <div
      key={id}
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
        // @ts-ignore
        value={thisParameter.name}
        onChange={(event) => {
          // const path = ReactEditor.findPath(editor, element);
          // const update: Partial<ParameterNode> = {
          //   parameterName: event.target.value,
          // };
          // Transforms.setNodes(editor, update, { at: path });
          // @ts-ignore
          thisParameter.name = event.target.value;
        }}
      />
      <br />
      Max length:{' '}
      <input
        type="number"
        className="parameter-max-length-input"
        // @ts-ignore
        value={thisParameter.maxLength}
        onChange={(event) => {
          // const path = ReactEditor.findPath(editor, element);
          // const update: Partial<ParameterNode> = {
          //   parameterOptions: {
          //     maxLength: parseInt(event.target.value),
          //   },
          // };
          // Transforms.setNodes(editor, update, { at: path });

          // @ts-ignore
          thisParameter.maxLength = parseInt(event.target.value);
        }}
      />
    </div>
  );
}
