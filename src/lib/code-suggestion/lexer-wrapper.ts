import { ATNState, Lexer } from '@syntaxica/antlr';
import { TokenizationErrorListener } from '$lib/code-suggestion/tokenization-error-listener';
import { TokenizationResult } from '$lib/code-suggestion/types/tokenization-result';
import { LexerFactory } from '$lib/code-suggestion/types/lexer-factory';

export class LexerWrapper<L extends Lexer> {
  private readonly lexerFactory: LexerFactory<L>;

  private cachedLexer?: L;

  public constructor(lexerFactory: LexerFactory<L>) {
    this.lexerFactory = lexerFactory;
    this.cachedLexer = undefined;
  }

  public tokenizeNonDefaultChannel = (input: string): TokenizationResult => {
    const errorListener = new TokenizationErrorListener(input);
    const lexer = this.createLexer(input);

    lexer.removeErrorListeners();
    lexer.addErrorListener(errorListener);

    return {
      textNotTokenized: errorListener.textNotTokenized,
      tokens: lexer.getAllTokens().filter((token) => token.channel === 0),
    };
  };

  public findStateByRuleNumber = (ruleNumber: number): ATNState =>
    this.getCachedLexer().atn.ruleToStartState.slice(ruleNumber, ruleNumber + 1)[0];

  public getCachedLexer(): L {
    if (this.cachedLexer === undefined) {
      this.cachedLexer = this.createLexer('');
    }

    return this.cachedLexer;
  }

  private createLexer = (input: string): L => this.lexerFactory(input);
}
