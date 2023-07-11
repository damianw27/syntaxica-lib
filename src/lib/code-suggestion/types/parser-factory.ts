import { Lexer, Parser } from '@syntaxica/antlr';

export type ParserFactory<L extends Lexer, P extends Parser> = (lexer: L) => P;
