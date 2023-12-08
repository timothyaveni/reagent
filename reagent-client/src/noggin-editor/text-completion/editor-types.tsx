import { BaseElement } from 'slate';

type ParameterOptions = {
  maxLength: number;
};

export interface ParameterNode extends BaseElement {
  type: 'parameter';
  parameterName: string;
  parameterOptions: ParameterOptions;
}

export interface ChatTurnNode extends BaseElement {
  type: 'chat-turn';
  speaker: 'user' | 'assistant';
}
