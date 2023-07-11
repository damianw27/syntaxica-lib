import { Token } from '@syntaxica/antlr';

export interface TokenizationResult {
  readonly textNotTokenized: string;
  readonly tokens: Token[];
}
