import { BaseElement } from 'slate';

type VariableOptions = {
  name: string;
  maxLength: number;
  defaultValue: string;
};

export interface VariableNode extends BaseElement {
  type: 'parameter';
  parameterId: string;
  parameterOptions: VariableOptions;
}

export interface ChatTurnNode extends BaseElement {
  type: 'chat-turn';
  speaker: 'user' | 'assistant' | 'developer';
}

export interface InlineImage extends BaseElement {
  type: 'inline-image';
  src: string;
}
