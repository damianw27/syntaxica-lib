import { SyntaxType } from '$lib/grammar-builder/enums/syntax-type';
import { SyntaxToken } from '$lib/grammar-builder/types/syntax-token';

export interface SyntaxObject {
  readonly pattern: SyntaxToken | SyntaxToken[];
  readonly syntaxType: SyntaxType;
}
