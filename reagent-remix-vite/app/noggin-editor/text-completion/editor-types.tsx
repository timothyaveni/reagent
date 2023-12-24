import { BaseElement } from 'slate';

type ParameterOptions = {
  name: string;
  maxLength: number;
  defaultValue: string;
};

export interface ParameterNode extends BaseElement {
  type: 'parameter';
  parameterId: string;
  parameterOptions: ParameterOptions;
}

export interface ChatTurnNode extends BaseElement {
  type: 'chat-turn';
  speaker: 'user' | 'assistant';
}

export interface InlineImage extends BaseElement {
  type: 'inline-image';
  src: string;
}