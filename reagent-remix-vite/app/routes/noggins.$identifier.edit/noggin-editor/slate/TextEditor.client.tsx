import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createEditor, Editor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';

import { useSyncedStore } from '@syncedstore/react';

import { withCursors, withYjs, YjsEditor } from '@slate-yjs/core';

import { Box, List, ListItemButton, Paper, Typography } from '@mui/material';
import { useLoaderData } from '@remix-run/react';
import T from '~/i18n/T';
import { StoreContext } from '~/routes/noggins.$identifier/StoreContext';
import {
  addNewVariable,
  EditorVariablesList,
  getVariableElements,
  insertVariableAtCursor,
  useEditorStore,
  useEditorVariables,
  useHasPopulatedStore,
} from '../editor-utils';
import { withChatElements, withPlainTextElements } from '../editorPlugins';
import { ChatTurn } from './ChatTurn';
import { Cursors } from './Cursors';
import { EditorToolbar } from './EditorToolbar';
import { InlineImage } from './InlineImage';
import './TextEditor.css';
import { TextFragment } from './TextFragment';
import { Variable } from './Variable';

const initialValue: any[] = [];

export type TextEditorProps = {
  documentKey: string;
  textType: 'plain' | 'chat';
  allowImages?: 'none' | 'user' | 'all';
  // className?: string;
  editorHeight?: 'primary' | 'default';
};

type VariableEditorClosedState = {
  open: false;
};
type VariableEditorOpenState = {
  open: true;
  position: {
    x: number;
    y: number;
  };
  selectedExistingVariableId: string | null;
};

type VariableEditorState = VariableEditorClosedState | VariableEditorOpenState;

// allows empty variable, which is not actually valid, but should not close the variable editor dialog
const VALID_VARIABLE_NAME_REGEX = /^[a-zA-Z0-9_-]*$/;

const getExactMatchForVariableEditorState = (
  variables: EditorVariablesList,
  variableSoFar: string,
) => {
  return variables.find((v) => v.variable.name === variableSoFar);
};

// ehh this is a bad refactor
const getTrueSelectionForVariableEditorState = (
  variables: EditorVariablesList,
  variableEditorState: VariableEditorOpenState,
  variableSoFar: string,
) => {
  const exactMatch = getExactMatchForVariableEditorState(
    variables,
    variableSoFar,
  );

  return exactMatch
    ? exactMatch.id
    : variableEditorState.selectedExistingVariableId;
};

const VariableEditor = ({
  variableEditorState,
  filteredVariables,
  variableSoFarMaybe,
  addNewVariable,
  addExistingVariable,
}: {
  variableEditorState: VariableEditorState;
  filteredVariables: EditorVariablesList;
  variableSoFarMaybe: string | null;
  addNewVariable: (variableName: string) => any;
  addExistingVariable: (variableId: string) => any;
}) => {
  if (!variableEditorState.open) {
    return null;
  }

  console.log({ filteredVariables });

  const variableSoFar = variableSoFarMaybe ?? '';

  const exactMatch = getExactMatchForVariableEditorState(
    filteredVariables,
    variableSoFar,
  );

  const trueSelection = getTrueSelectionForVariableEditorState(
    filteredVariables,
    variableEditorState,
    variableSoFar,
  );

  return (
    <Box
      position="absolute"
      left={variableEditorState.position.x}
      top={variableEditorState.position.y}
      zIndex={1000}
    >
      <Paper elevation={2}>
        <Box sx={{ pt: 1, px: 2 }}>
          <Typography variant="overline" color="textSecondary">
            <T>Add variable</T>
          </Typography>
        </Box>
        <List>
          {variableSoFar !== '' ? (
            exactMatch ? null : (
              <ListItemButton
                key="new"
                selected={!trueSelection}
                onClick={() => {
                  addNewVariable(variableSoFar);
                }}
              >
                <T>
                  + new variable &ldquo;{variableSoFar}
                  &rdquo;
                </T>
              </ListItemButton>
            )
          ) : null}
          {filteredVariables.map((v) => (
            <ListItemButton
              key={v.id}
              selected={trueSelection === v.id}
              onClick={() => {
                addExistingVariable(v.id);
              }}
            >
              {v.variable.name}
            </ListItemButton>
          ))}
        </List>
        {variableSoFar === '' ? (
          filteredVariables.length > 0 ? (
            <Typography variant="body2" color="textPrimary" px={2} pb={2}>
              <T>or keep typing to add a new variable.</T>
            </Typography>
          ) : (
            <Typography variant="body2" color="textPrimary" px={2} pb={2}>
              <T>Keep typing to add a new variable.</T>
            </Typography>
          )
        ) : null}
      </Paper>
    </Box>
  );
};

const TextEditor = ({
  documentKey,
  textType,
  allowImages = 'none', // TODO
  editorHeight,
}: TextEditorProps) => {
  // todo type
  const { userInfo } = useLoaderData() as {
    userInfo?: null | {
      displayName: string;
    };
  };

  const store = useEditorStore();
  const hasPopulatedStore = useHasPopulatedStore();

  console.log({ store, hasPopulatedStore });

  if (!hasPopulatedStore) {
    // this breaks prop rules, but we're throwing an error anyway -- this is being checked higher in the component tree
    throw new Error('trying to render a null store');
  }

  const { websocketProvider } = useContext(StoreContext);

  if (!websocketProvider) {
    throw new Error('trying to render a null websocket provider');
  }

  const modelInputs = useSyncedStore(store.modelInputs);
  const variables = useEditorVariables();

  const [variableEditorState, setVariableEditorState] =
    useState<VariableEditorState>({ open: false });

  const cursorName = localStorage.getItem('cursor-name'); // TODO don't do it like this
  const cursorColor = localStorage.getItem('cursor-color');

  const editor = useMemo(() => {
    const withReagentAugmentations =
      textType === 'chat' ? withChatElements : withPlainTextElements;

    let e = withCursors(
      withYjs(
        withReagentAugmentations(
          withReact(withHistory(createEditor()), 'x-reagent-noggin-text'),
        ),
        modelInputs[documentKey]!,
      ),
      websocketProvider.awareness,
      {
        data: {
          name: userInfo?.displayName || 'User',
          color: '#000000', // TODO? maybe do this on the receiving client
        },
      },
    );

    return e;
  }, [modelInputs, modelInputs[documentKey], cursorName, cursorColor]);

  useEffect(() => {
    console.log('editor useeffect');
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'parameter':
        return <Variable {...props} />;
      case 'chat-turn':
        return <ChatTurn {...props} />;
      case 'image':
        return <InlineImage {...props} />;
      default:
        return <TextFragment {...props} />;
    }
  }, []);

  // TODO: flow state dump 2023-12-08 17:12 -- need to keep a separate list of ids for each doc and merge for the control section. sync should be just for this doc.
  const syncVariables = useCallback(() => {
    const parameterOptionDict = store.documentParameters;

    const variableElements = getVariableElements(editor);
    for (const element of variableElements) {
      // console.log(
      //   'sync',
      //   element,
      //   JSON.stringify(store.documentParameterIdsByDocument[documentKey]),
      // );
      if (!parameterOptionDict[element.parameterId]) {
        // this can happen if we paste in a variable from elsewhere. likely don't need this after TODO(param-sync), or at least it will likely change in implementation
        console.log({ element });
        addNewVariable(
          store,
          undefined, // no name from the pasted param
          element.parameterId,
        );
      }

      if (
        !store.documentParameterIdsByDocument[documentKey]!.includes(
          element.parameterId,
        )
      ) {
        console.log('没有');
        store.documentParameterIdsByDocument[documentKey]!.push(
          element.parameterId,
        );
      }
    }

    // now delete any that are no longer in the editor
    const ids = [...store.documentParameterIdsByDocument[documentKey]!]; // I think we need to pre-compute to avoid the iterator bug
    for (const id of ids) {
      if (!variableElements.some((e) => e.parameterId === id)) {
        // okay, so, the plan is to sync parameter metadata into the editor state so that copy-paste works.
        // this is going to be yucky and i don't want to do it right now.
        // another way to get most of the way there is to just keep metadata around -- this doesn't work if you, like, refresh the page (well, assuming the room gets killed), and it's a memory leak, but at least it works for now.
        // we still won't *render* stale parameters, because we're still splicing old params out of the array, but we secretly keep their metadata in the dict.
        // this isn't the real reason we have a separate array and object (that was to get the damn thing to rerender), but at least it gives us this for free
        // TODO(param-sync)
        // delete store.documentParameters[id];
        store.documentParameterIdsByDocument[documentKey]!.splice(
          store.documentParameterIdsByDocument[documentKey]!.indexOf(id),
          1,
        );
      }
    }
  }, [editor]);

  const getCurrentTypedVariableName = () => {
    if (!variableEditorState.open) {
      return null;
    }

    const { selection } = editor;
    if (!selection) {
      return null;
    }

    const [node] = Editor.node(editor, selection.focus);
    // not very dry but the gate at the top makes it a little annoying to use this below
    if ('text' in node) {
      const { text } = node;
      const offset = selection.focus.offset;
      console.log({ text, offset });
      const before = text.slice(0, offset);
      const startIndex = before.lastIndexOf('$');
      if (startIndex === -1) {
        return null;
      }

      const variableName = before.slice(startIndex + 1);

      console.log({ variableName });
      console.log('test', VALID_VARIABLE_NAME_REGEX.test(variableName));

      if (!VALID_VARIABLE_NAME_REGEX.test(variableName)) {
        return null;
      }

      return variableName;
    } else {
      return null;
    }
  };

  const [lastTypedVariableName, setLastTypedVariableName] = useState<
    null | string
  >(null);

  const getCurrentVariableListForEditor = () => {
    return variables.filter((v) =>
      v.variable.name.startsWith(lastTypedVariableName ?? ''),
    );
  };

  const addVariableInEditor = useCallback(
    (variableId: string) => {
      setVariableEditorState({
        open: false,
      });

      const { selection } = editor;
      if (!selection) {
        return; // todo idk error or something
      }

      const [node] = Editor.node(editor, selection.focus);
      if ('text' in node) {
        const { text } = node;
        const offset = selection.focus.offset;
        const before = text.slice(0, offset);
        const startIndex = before.lastIndexOf('$');
        if (startIndex === -1) {
          return; // noop idk
        }

        Transforms.delete(editor, {
          at: {
            anchor: {
              path: selection.focus.path,
              offset: startIndex,
            },
            focus: selection.focus,
          },
        });

        insertVariableAtCursor(editor, variableId);
      } else {
        return; // noop
      }
    },
    [editor, setVariableEditorState],
  );

  const addSpace = () => {
    Transforms.insertText(editor, ' ');
  };

  // TODO we close it in a lot of cases now but not when unfocusing, might be good
  // but might also need to be careful not to lose state in case normal use causes an unfocus
  const openVariableEditor = () => {
    // TODO: honestly skeptical that there's a better way to wait for the character to be inserted
    // but we need this so selection will update, which puts the popup in the right spot
    // UGH TODO looks like 0ms doesn't even do it???
    setTimeout(() => {
      const { selection } = editor;
      if (!selection) {
        return; // i don't think this can happen?
      }
      const selectionPoint = ReactEditor.toDOMRange(
        editor,
        selection,
      ).getBoundingClientRect();

      const PADDING = 32;
      setVariableEditorState({
        open: true,
        position: {
          x: selectionPoint.left,
          y: selectionPoint.top + window.scrollY + PADDING,
        },
        selectedExistingVariableId: null,
      });
    }, 10);
  };

  return (
    <Box
      mt={1}
      mb={2}
      className={
        'slate-wrapper ' +
        (editorHeight === 'primary' ? 'slate-wrapper-main' : '')
      }
    >
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          console.log('onchange', value);
          syncVariables();

          // we don't seem to get a rerender if we don't do this. hopefully doesn't make things slow since setState(null) on null won't rerender?
          const currentTypedVariableName = getCurrentTypedVariableName();
          setLastTypedVariableName(currentTypedVariableName);

          if (currentTypedVariableName === null && variableEditorState.open) {
            setVariableEditorState({
              open: false,
            });
          }
        }}
      >
        <Cursors>
          <Editable
            renderElement={renderElement}
            onKeyDown={(event) => {
              if (variableEditorState.open) {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setVariableEditorState({
                    open: false,
                  });
                } else if (
                  event.key === 'Enter' ||
                  event.key === 'Tab' ||
                  event.key === ' '
                ) {
                  event.preventDefault();
                  const variableSoFar = lastTypedVariableName;
                  const trueSelection = getTrueSelectionForVariableEditorState(
                    variables,
                    variableEditorState,
                    variableSoFar ?? '', // TODO not so dry
                  );

                  if (trueSelection === null) {
                    // new variable
                    // shouldn't be possible for it to exist already bc the ui will select the extant var
                    if (variableSoFar) {
                      // TODO not so dry
                      const variableId = addNewVariable(store, variableSoFar);
                      addVariableInEditor(variableId);
                      if (event.key === ' ') {
                        addSpace();
                      }
                    } else {
                      // this will close the popup. bit of a strange interaction if we hit Enter (TODO?) but is fine for now
                      addSpace();
                    }
                  } else {
                    // existing variable
                    addVariableInEditor(trueSelection);
                    if (event.key === ' ') {
                      addSpace();
                    }
                  }
                } else if (
                  event.key === 'ArrowDown' ||
                  event.key === 'ArrowUp'
                ) {
                  event.preventDefault();

                  // ugh really don't like this, it duplicates the render logic
                  const currentIdList = [
                    ...(lastTypedVariableName ? [null] : []),
                    ...getCurrentVariableListForEditor().map((v) => v.id),
                  ];

                  console.log({ currentIdList });

                  const trueSelection = getTrueSelectionForVariableEditorState(
                    variables,
                    variableEditorState,
                    lastTypedVariableName ?? '', // TODO not so dry
                  );

                  const currentIndex = currentIdList.findIndex(
                    (v) => v === trueSelection,
                  );

                  const newIndex =
                    (currentIndex +
                      (event.key === 'ArrowDown' ? 1 : -1) +
                      // if only we had negative mod, sigh
                      currentIdList.length) %
                    currentIdList.length;

                  const newSelection = currentIdList[newIndex];

                  setVariableEditorState({
                    ...variableEditorState,
                    selectedExistingVariableId: newSelection,
                  });
                }
              } else {
                if (event.key === '$') {
                  openVariableEditor();
                }
              }
            }}
          />
        </Cursors>
        <EditorToolbar
          textType={textType}
          editor={editor}
          openVariableEditor={openVariableEditor}
        />
      </Slate>
      <VariableEditor
        variableEditorState={variableEditorState}
        variableSoFarMaybe={lastTypedVariableName}
        filteredVariables={getCurrentVariableListForEditor()}
        addNewVariable={(variableName: string) => {
          const variableId = addNewVariable(store, variableName);
          addVariableInEditor(variableId);
          ReactEditor.focus(editor);
        }}
        addExistingVariable={(variableId: string) => {
          addVariableInEditor(variableId);
          ReactEditor.focus(editor);
        }}
      />
    </Box>
  );
};

export default TextEditor;
