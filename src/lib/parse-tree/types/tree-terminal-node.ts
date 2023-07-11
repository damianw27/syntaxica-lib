export interface TreeTerminalNode {
  readonly type: number;
  readonly text: string;
}

export const isTreeTerminalNode = (node: any): node is TreeTerminalNode =>
  'type' in node && typeof node.type === 'number' && 'text' in node && typeof node.text === 'string';
