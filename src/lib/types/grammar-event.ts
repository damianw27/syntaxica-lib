import { GrammarEventType } from '$lib/types/grammar-event-type';

interface ParsePayload {
  readonly text: string;
}

interface UtilitiesPayload {
  readonly text: string;
}

interface ParseGrammarEvent {
  readonly type: GrammarEventType.Parse;
  readonly payload: ParsePayload;
}

interface UtilitiesGrammarEvent {
  readonly type: GrammarEventType.Utilities;
  readonly payload: UtilitiesPayload;
}

interface InitializeGrammarEvent {
  readonly type: GrammarEventType.Initialize;
}

export type GrammarEvent = ParseGrammarEvent | UtilitiesGrammarEvent | InitializeGrammarEvent;
