export interface GrammarParsingError {
  readonly lineIndex: number;
  readonly charPosition: number;
  readonly message: string;
}
