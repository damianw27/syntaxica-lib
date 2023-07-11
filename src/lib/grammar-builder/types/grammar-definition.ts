import { SyntaxObject } from '$lib/grammar-builder/types/syntax-object';

export interface GrammarDefinition {
  readonly name: string;
  readonly keywords: string[];
  readonly syntax: SyntaxObject[];
}
