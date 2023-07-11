import { GrammarParsingError } from '$lib/types/grammar-parsing-error';
import { ParseTree } from '$root/lib';

export interface GrammarEventResultParse {
  readonly text: string;
  readonly suggestions: string[];
  readonly parseTree: ParseTree;
  readonly errors: GrammarParsingError[];
  readonly isInvalid: boolean;
}
