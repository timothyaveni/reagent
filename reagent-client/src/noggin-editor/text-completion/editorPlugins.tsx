import {
  Node,
  Transforms
} from 'slate';
import { ChatTurnNode } from './editor-types';

export const withChatCompletionsElements = (editor: any) => {
  const { isInline, isVoid, normalizeNode } = editor;

  editor.isInline = (element: any) => {
    if (element.type === 'parameter') {
      return true;
    }

    if (element.type === 'chat-turn') {
      return false;
    }

    return isInline(element);
  };

  editor.isVoid = (element: any) => {
    if (element.type === 'parameter') {
      return true;
    }

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
          { at: [0] }
        );
      };

      // if no children or we aren't starting with a chat turn, add one.
      // UNLESS the top paragraph is empty and the next thing is a chat turn -- then we should just delete the paragraph. this is the common mode if you delete the top chat turn but still want the other stuff in there
      if (editor.children.length === 0) {
        insertTopChatTurn();
      } else {
        const topChild = editor.children[0];
        if (topChild.type === 'paragraph' &&
          topChild.children[0].text === '' &&
          editor.children[1]?.type === 'chat-turn') {
          Transforms.removeNodes(editor, { at: [0] });
        } else if (topChild.type !== 'chat-turn') {
          insertTopChatTurn();
        }
      }

      // go through the top-level elements. if any chat turn isn't followed by a paragraph, add one
      for (let i = 0; i < editor.children.length; i++) {
        const child = editor.children[i];
        // console.log(1, child, i, editor.children.length);
        if (child.type === 'chat-turn' &&
          ((i < editor.children.length - 1 &&
            editor.children[i + 1].type !== 'paragraph') ||
            i === editor.children.length - 1)) {
          Transforms.insertNodes(
            editor,
            {
              type: 'paragraph',
              children: [{ text: '' }],
            } as unknown as Node,
            { at: [i + 1] }
          );
        }
      }

      // merge paragraphs that are next to each other
      for (let i = 0; i < editor.children.length; i++) {
        const child = editor.children[i];
        // console.log(2, child);
        if (child.type === 'paragraph' &&
          i < editor.children.length - 1 &&
          editor.children[i + 1].type === 'paragraph') {
          const text = child.children[0].text +
            '\n' +
            editor.children[i + 1].children[0].text;
          Transforms.mergeNodes(editor, { at: [i + 1] });
          i--; // hmm feels like i need this
          // nah, turns out slate will keep normalizing until nothing changes
        }
      }
    }

    // todo: make sure params with same name have same options

    return normalizeNode([node, path]);
  };

  return editor;
};

export const withSoftBreak = (editor: any) => {
  editor.insertBreak = () => {
    return editor.insertText('\n');
  };

  editor.insertSoftBreak = () => {
    // todo: add a chat turn, different from the one we'e currently in (the last one before the selection)

    let speaker = 'user';
    const { selection } = editor;

    if (selection) {
      // todo
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