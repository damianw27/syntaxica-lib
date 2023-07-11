import { TreeNode } from '$lib/parse-tree/types/tree-node';

export interface TreeRuleNode {
  readonly name: string;
  readonly children: TreeNode[];
}

export const isTreeRuleNode = (node: any): node is TreeRuleNode =>
  'name' in node && typeof node.name === 'string' && 'children' in node && Array.isArray(node.children);
