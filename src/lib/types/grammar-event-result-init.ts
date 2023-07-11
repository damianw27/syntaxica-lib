import { GrammarDefinition } from '$lib/grammar-builder/types/grammar-definition';
import { GrammarExample } from '$lib/types/grammar-example';

export interface GrammarEventResultInit {
  readonly grammarDefinition: GrammarDefinition;
  readonly examples: GrammarExample[];
}
