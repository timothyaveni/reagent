import { BaseElement } from 'slate';

type ParameterOptions = {
  name: string;
  maxLength: number;
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
