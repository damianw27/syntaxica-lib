import { Lexer } from '@syntaxica/antlr';
import { LexingErrorListener } from '$root/lib';

export type LexerFactory<L extends Lexer> = (input: string, listener?: LexingErrorListener) => L;
