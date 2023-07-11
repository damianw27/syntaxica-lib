import { TreeTerminalNode } from '$lib/parse-tree/types/tree-terminal-node';
import { TreeRuleNode } from '$lib/parse-tree/types/tree-rule-node';

export type TreeNode = TreeTerminalNode | TreeRuleNode;
