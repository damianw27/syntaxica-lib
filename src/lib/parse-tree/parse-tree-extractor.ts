import { Parser, ParserRuleContext, Token } from '@syntaxica/antlr';
import { TreeNode } from '$lib/parse-tree/types/tree-node';
import { TreeTerminalNode } from '$lib/parse-tree/types/tree-terminal-node';
import { TreeRuleNode } from '$lib/parse-tree/types/tree-rule-node';
import { ParseTree } from '$lib/parse-tree/types/parse-tree';

export class ParseTreeExtractor<P extends Parser> {
  private readonly ruleNames: string[];

  public constructor(private readonly parser: P) {
    this.ruleNames = parser.ruleNames;
  }

  public extract(parserRuleContext: ParserRuleContext): ParseTree {
    const outTree: TreeNode[] = [];
    this.performExtraction(parserRuleContext, outTree);
    return outTree;
  }

  private performExtraction(parserRuleContext: ParserRuleContext, parentChildren: TreeNode[]): void {
    if ('symbol' in parserRuleContext) {
      const { type, text } = parserRuleContext.symbol as Token;
      const terminalNode: TreeTerminalNode = { type, text };
      parentChildren.push(terminalNode);
    } else {
      const ruleNode: TreeRuleNode = {
        name: this.ruleNames[parserRuleContext.ruleIndex],
        children: [],
      };

      (parserRuleContext.children ?? []).forEach((item) => this.performExtraction(item, ruleNode.children));
      parentChildren.push(ruleNode);
    }
  }
}
