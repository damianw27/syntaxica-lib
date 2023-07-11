import { LexingErrorListener } from '$workers/sparql/lexing-error-listener';
import { ParsingErrorListener } from '$workers/sparql/parsing-error-listener';

export interface ErrorListenersParam {
  readonly lexingErrorListener?: LexingErrorListener;
  readonly parsingErrorListener?: ParsingErrorListener;
}
