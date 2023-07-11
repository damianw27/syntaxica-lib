import { Lexer, Parser } from '@syntaxica/antlr';
import { LexerFactory } from '$lib/code-suggestion/types/lexer-factory';
import { ParserFactory } from '$lib/code-suggestion/types/parser-factory';
import { CaseKind } from '$lib/code-suggestion/types/case-kind';
import { SuggestionsBuilder } from '$lib/code-suggestion/suggestions-builder';

export class SuggestionsProvider<L extends Lexer, P extends Parser> {
  public constructor(
    private readonly lexerFactory: LexerFactory<L>,
    private readonly parserFactory: ParserFactory<L, P>,
    private readonly casePreference?: CaseKind,
  ) {
    this.assertLexerHasAtn();
  }

  public suggest = (input: string): string[] => {
    const builder = new SuggestionsBuilder(this.lexerFactory, this.parserFactory, input);

    if (this.casePreference) {
      builder.setCasePreference(this.casePreference);
    }

    return builder.suggest();
  };

  private assertLexerHasAtn = (): void => {
    const lexer = this.lexerFactory('');

    if (typeof lexer.atn === 'undefined') {
      throw new Error('Please use ANTLR4 version 4.7.1 or above.');
    }
  };
}
