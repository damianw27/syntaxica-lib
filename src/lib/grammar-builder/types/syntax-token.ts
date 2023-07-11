export interface SyntaxToken {
  pattern: RegExp;
  lookbehind?: boolean | undefined;
  greedy?: boolean | undefined;
}
