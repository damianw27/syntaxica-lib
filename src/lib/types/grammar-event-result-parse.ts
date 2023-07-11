import { ParseTree } from '@syntaxica/antlr';
import { GrammarParsingError } from '$lib/types/grammar-parsing-error';

export interface GrammarEventResultParse {
  readonly text: string;
  readonly suggestions: string[];
  readonly parseTree: ParseTree;
  readonly errors: GrammarParsingError[];
  readonly isInvalid: boolean;
}
