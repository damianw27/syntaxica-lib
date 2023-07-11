import { ErrorListener, Recognizer, Token } from '@syntaxica/antlr';
import { GrammarParsingError } from '$root/lib';

export class ParsingErrorListener implements ErrorListener<Token> {
  private readonly _errors: GrammarParsingError[] = [];

  // eslint-disable-next-line max-params
  public syntaxError(
    recognizer: Recognizer<Token>,
    offendingSymbol: Token | undefined,
    line: number,
    charPositionInLine: number,
    msg: string,
  ): void {
    const parserError: GrammarParsingError = {
      lineIndex: line,
      charPosition: charPositionInLine,
      message: msg,
    };

    this._errors.push(parserError);
  }

  public reportAmbiguity() {}

  public reportAttemptingFullContext() {}

  public reportContextSensitivity() {}

  public get errors() {
    return this._errors;
  }
}
