import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ChatTurnNode } from './editor-types';

const withVariableElements = (editor: ReactEditor): ReactEditor => {
  const { isInline, isVoid, normalizeNode } = editor;

  editor.isInline = (element: any) => {
    if (element.type === 'parameter') {
      return true;
    }

    return isInline(element);
  };

  editor.isVoid = (element: any) => {
    if (element.type === 'parameter') {
      return true;
    }

    return isVoid(element);
  };

  return editor;
};

const withSharedNormalization = (editor: ReactEditor): ReactEditor => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]: [any, any]) => {
    if (path.length === 0) {
      // merge paragraphs that are next to each other
      for (let i = 0; i < editor.children.length; i++) {
        const child = editor.children[i];
        if (
          // @ts-ignore
          child.type === 'paragraph' &&
          i < editor.children.length - 1 &&
          // @ts-ignore
          editor.children[i + 1].type === 'paragraph'
        ) {
          Transforms.mergeNodes(editor, { at: [i + 1] });
          break; // normalization will run until convergence
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

const withPlainTextNormalization = (editor: ReactEditor): ReactEditor => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]: [any, any]): void => {
    const normalizeRoot = ([node, path]: [any, any]): void => {
      // if empty, add an empty paragraph
      if (editor.children.length === 0) {
        Transforms.insertNodes(
          editor,
          {
            type: 'paragraph',
            children: [{ text: '' }],
          } as unknown as Node,
          { at: [0] },
        );

        return;
      }

      // if we have any chat turns (like, because we copied from a chat completion model), replace them with 'User: ' and 'Assistant: '
      // (this is probably something we should be doing not at the root... but this should work and it's easier for me to reason about right now))
      for (let i = 0; i < editor.children.length; i++) {
        const child = editor.children[i];
        if (
          // @ts-ignore
          child.type === 'chat-turn'
        ) {
          const { speaker } = child as ChatTurnNode;
          console.log('triggered normalization', child, editor.children, i);

          // if the next one is a paragraph, prepend
          if (
            i < editor.children.length - 1 &&
            // @ts-ignore
            editor.children[i + 1].type === 'paragraph'
          ) {
            Transforms.removeNodes(editor, { at: [i] });
            // ugh todo having trouble figuring this out right now
            // Transforms.insertText(
            //   editor,
            //   `${speaker === 'user' ? '\n\nUser' : '\n\nAssistant'}: `,
            //   { at: [i, 0] },
            // );
            return;
          } else {
            Transforms.removeNodes(editor, { at: [i] });
            return;
          }
        }
      }
    };

    if (path.length === 0) {
      normalizeRoot([node, path]);
    }

    normalizeNode([node, path]);
  };

  return editor;
};

const withChatCompletionsSpecificElements = (
  editor: ReactEditor,
): ReactEditor => {
  const { isInline, isVoid, normalizeNode } = editor;

  editor.isInline = (element: any) => {
    if (element.type === 'chat-turn') {
      return false;
    }

    return isInline(element);
  };

  editor.isVoid = (element: any) => {
    if (element.type === 'chat-turn') {
      return true;
    }

    return isVoid(element);
  };

  editor.normalizeNode = ([node, path]: [any, any]) => {
    // we're normalizing the root node
    if (path.length === 0) {
      const insertTopChatTurn = () => {
        // this is a little weird as a thing to do if they backspace the top chat turn and it was an 'assistant' turn and it converts to a user one -- really what we want to do is forbid the backspace, but this will do
        Transforms.insertNodes(
          editor,
          {
            type: 'chat-turn',
            speaker: 'user',
            children: [{ text: '' }],
          } as ChatTurnNode,
          { at: [0] },
        );
      };

      // if no children or we aren't starting with a chat turn, add one.
      // UNLESS the top paragraph is empty and the next thing is a chat turn -- then we should just delete the paragraph. this is the common mode if you delete the top chat turn but still want the other stuff in there
      if (editor.children.length === 0) {
        insertTopChatTurn();
      } else {
        const topChild = editor.children[0];
        if (
          // @ts-ignore
          topChild.type === 'paragraph' &&
          // @ts-ignore
          topChild.children[0].text === '' &&
          // @ts-ignore
          editor.children[1]?.type === 'chat-turn'
        ) {
          Transforms.removeNodes(editor, { at: [0] });
          // @ts-ignore
        } else if (topChild.type !== 'chat-turn') {
          insertTopChatTurn();
        }
      }

      // go through the top-level elements. if any chat turn isn't followed by a paragraph, add one
      for (let i = 0; i < editor.children.length; i++) {
        const child = editor.children[i];
        // console.log(1, child, i, editor.children.length);
        if (
          // @ts-ignore
          child.type === 'chat-turn' &&
          ((i < editor.children.length - 1 &&
            // @ts-ignore
            editor.children[i + 1].type !== 'paragraph') ||
            i === editor.children.length - 1)
        ) {
          Transforms.insertNodes(
            editor,
            {
              type: 'paragraph',
              children: [{ text: '' }],
            } as unknown as Node,
            { at: [i + 1] },
          );
        }
      }
    }

    // todo: make sure params with same name have same options

    return normalizeNode([node, path]);
  };

  return editor;
};

const withPlainSoftBreak = (editor: ReactEditor): ReactEditor => {
  editor.insertBreak = () => {
    return editor.insertText('\n');
  };

  editor.insertSoftBreak = () => {
    return editor.insertText('\n');
  };

  return editor;
};

const withChatSoftBreak = (editor: ReactEditor): ReactEditor => {
  editor.insertBreak = () => {
    return editor.insertText('\n');
  };

  editor.insertSoftBreak = () => {
    let speaker = 'user';
    const { selection } = editor;

    if (selection) {
      // get last parent chat node before selection
      const selectionTopLevelNode = selection.focus.path[0];
      for (let i = selectionTopLevelNode - 1; i >= 0; i--) {
        const node = editor.children[i];
        if (
          // @ts-ignore
          node.type === 'chat-turn'
        ) {
          // @ts-ignore
          speaker = node.speaker === 'user' ? 'assistant' : 'user';
          break;
        }
      }
    }

    Transforms.insertNodes(editor, {
      type: 'chat-turn',
      speaker,
      children: [{ text: '' }],
    } as ChatTurnNode);
    Transforms.move(editor);
  };

  return editor;
};

const withSharedBehavior = (editor: ReactEditor): ReactEditor => {
  let e = editor;

  e = withSharedNormalization(e);
  e = withVariableElements(e);

  return e;
};

export const withPlainTextElements = (editor: ReactEditor): ReactEditor => {
  let e = editor;

  e = withSharedBehavior(e);
  e = withPlainTextNormalization(e);
  e = withPlainSoftBreak(e);

  return e;
};

export const withChatElements = (editor: ReactEditor): ReactEditor => {
  let e = editor;

  e = withSharedBehavior(e);
  e = withChatCompletionsSpecificElements(e);
  e = withChatSoftBreak(e);

  return e;
};
