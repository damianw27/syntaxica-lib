import { Lexer, Parser } from '@syntaxica/antlr';
import { ParsingErrorListener } from '$root/lib';

export type ParserFactory<L extends Lexer, P extends Parser> = (lexer: L, listener?: ParsingErrorListener) => P;
