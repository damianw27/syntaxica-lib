import { Lexer } from '@syntaxica/antlr';

export type LexerFactory<L extends Lexer> = (input: string) => L;
