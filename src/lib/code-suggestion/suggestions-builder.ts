import { ATN, ATNState, AtomTransition, Lexer, Parser, SetTransition, Token, Transition } from '@syntaxica/antlr';
import { LexerWrapper } from '$lib/code-suggestion/lexer-wrapper';
import { LexerFactory } from '$lib/code-suggestion/types/lexer-factory';
import { CaseKind } from '$lib/code-suggestion/enums/case-kind';
import { ParserFactory } from '$lib/code-suggestion/types/parser-factory';
import { TokenSuggester } from '$lib/code-suggestion/token-suggester';

const getTransitionKey = (state: ATNState, transition: Transition): string =>
  `${state.stateNumber} -> (${transition.serializationType}) -> ${transition.target.stateNumber}`;

const transitionToString = (transition: Transition): string => `${transition.constructor.name} -> ${transition.target}`;

export class SuggestionsBuilder<L extends Lexer, P extends Parser> {
  private readonly lexerWrapper: LexerWrapper<L>;

  private readonly lexerFactory: LexerFactory<L>;

  private readonly parserFactory: ParserFactory<L, P>;

  private readonly input: string;

  private readonly collectedSuggestions: string[];

  private inputTokens: Token[];

  private notTokenizedText: string;

  private parserAtn?: ATN;

  private parserRuleNames: string[];

  private indent: string;

  private casePreference: CaseKind;

  private parserStatesCache: Map<ATNState, number>;

  public constructor(lexerFactory: LexerFactory<L>, parserFactory: ParserFactory<L, P>, input: string) {
    this.lexerWrapper = new LexerWrapper(lexerFactory);
    this.lexerFactory = lexerFactory;
    this.parserFactory = parserFactory;
    this.input = input;
    this.inputTokens = [];
    this.notTokenizedText = '';
    this.parserAtn = undefined;
    this.parserRuleNames = [];
    this.indent = '';
    this.collectedSuggestions = [];
    this.casePreference = CaseKind.Both;
    this.parserStatesCache = new Map<ATNState, number>();
  }

  public suggest = (): string[] => {
    this.tokenize();
    this.storeParserAtnAndRuleNames();
    this.runParserAtnAndCollectSuggestions();
    return this.collectedSuggestions;
  };

  public setCasePreference = (casePreference: CaseKind): void => {
    this.casePreference = casePreference;
  };

  private tokenize = (): void => {
    const { textNotTokenized, tokens } = this.lexerWrapper.tokenizeNonDefaultChannel(this.input);
    this.notTokenizedText = textNotTokenized;
    this.inputTokens = tokens;
  };

  private storeParserAtnAndRuleNames = (): void => {
    const lexer = this.lexerWrapper.getCachedLexer();
    const parser = this.parserFactory(lexer);
    this.parserAtn = parser._interp.atn;
    this.parserRuleNames = parser.ruleNames;
  };

  private runParserAtnAndCollectSuggestions = (): void => {
    const initialState = this.parserAtn?.states[0];

    if (initialState === undefined) {
      return;
    }

    this.parseAndCollectTokenSuggestions(initialState, 0);
  };

  private parseAndCollectTokenSuggestions = (state: ATNState, tokenListIndex: number): void => {
    const prevIndent = this.indent;
    this.indent += ' ';

    if (this.isParseStateVisitedAt(state, tokenListIndex)) {
      return;
    }

    const previousTokenListIndex = this.updateParserStateCache(state, tokenListIndex);

    if (this.haveMoreTokens(tokenListIndex)) {
      this.suggestNextTokensForParserState(state);
    }

    state.transitions.forEach((transition) => {
      if (transition.isEpsilon) {
        this.handleEpsilonTransition(transition, tokenListIndex);
      } else if (transition.serializationType === 5) {
        this.handleAtomicTransition(transition as AtomTransition, tokenListIndex);
      } else if (transition.serializationType === 7) {
        this.handleSetTransition(transition as SetTransition, tokenListIndex);
      }
    });

    this.indent = prevIndent;
    this.updateParserStateCache(state, previousTokenListIndex);
  };

  private isParseStateVisitedAt = (parserState: ATNState, currentTokenListIndex: number): boolean => {
    const lastVisitedThisStateAtTokenListIndex = this.parserStatesCache.get(parserState);
    return currentTokenListIndex === lastVisitedThisStateAtTokenListIndex;
  };

  private updateParserStateCache = (parserState: ATNState, tokenListIndex?: number): number => {
    const previous = this.parserStatesCache.get(parserState);

    if (tokenListIndex === undefined) {
      this.parserStatesCache.delete(parserState);
    } else {
      this.parserStatesCache.set(parserState, tokenListIndex);
    }

    return previous ?? -1;
  };

  private haveMoreTokens = (index: number): boolean => index < this.inputTokens.length;

  private suggestNextTokensForParserState = (state: ATNState): void => {
    const transitionLabels = new Set<number>();
    this.getTransitionLabels(state, transitionLabels, new Set<string>());
    const tokenSuggester = new TokenSuggester(this.notTokenizedText, this.lexerWrapper, this.casePreference);

    const suggestions = tokenSuggester
      .suggest([...transitionLabels])
      .filter((suggestion) => !suggestion.includes('\t') && !suggestion.includes('00'));

    this.parseSuggestionsAndAddValidOnes(state, suggestions);
  };

  private getTransitionLabels = (state: ATNState, output: Set<number>, visited: Set<string>): void => {
    state.transitions.forEach((transition) => {
      const transitionKey = getTransitionKey(state, transition);

      if (visited.has(transitionKey)) {
        return;
      }

      if (transition.isEpsilon) {
        visited.add(transitionKey);
        this.getTransitionLabels(transition.target, output, visited);
        visited.delete(transitionKey);
      } else if (transition.serializationType === 5) {
        output.add((transition as AtomTransition).label_);
      } else if (transition.serializationType === 7) {
        transition.label.intervals.forEach((interval) => {
          for (let intervalIndex = interval.start; intervalIndex < interval.stop; intervalIndex += 1) {
            output.add(intervalIndex);
          }
        });
      }
    });
  };

  private parseSuggestionsAndAddValidOnes = (state: ATNState, suggestions: string[]): void => {
    suggestions.forEach((suggestion) => {
      const addedToken = this.getAddedToken(suggestion);

      if (
        this.isParseableWithAddedToken(state, addedToken, new Set()) &&
        !this.collectedSuggestions.includes(suggestion)
      ) {
        this.collectedSuggestions.push(suggestion);
      }
    });
  };

  private getAddedToken = (suggestion: string): Token | null => {
    const completedText = this.input + suggestion;
    const completedTextTokens = this.lexerWrapper.tokenizeNonDefaultChannel(completedText).tokens;

    if (completedTextTokens.length <= this.inputTokens.length) {
      return null;
    }

    return completedTextTokens[completedTextTokens.length - 1];
  };

  private isParseableWithAddedToken(state: ATNState, token: Token | null, visitedTransitions: Set<string>): boolean {
    if (token === null) {
      return false;
    }

    let parseable = false;

    state.transitions.forEach((transition) => {
      if (transition.isEpsilon) {
        const transitionKey = getTransitionKey(state, transition);

        if (visitedTransitions.has(transitionKey)) {
          return;
        }

        visitedTransitions.add(transitionKey);

        if (this.isParseableWithAddedToken(transition.target, token, visitedTransitions)) {
          parseable = true;
        }

        visitedTransitions.delete(transitionKey);
      } else if (transition.serializationType === 5) {
        const transitionTokenType = (transition as AtomTransition).label_;

        if (transitionTokenType === token.type) {
          parseable = true;
        }
      } else if (transition.serializationType === 7) {
        transition.label.intervals.forEach((interval) => {
          for (
            let transitionTokenType = interval.start;
            transitionTokenType <= interval.stop;
            transitionTokenType += 1
          ) {
            if (transitionTokenType === token.type) {
              parseable = true;
            }
          }
        });
      } else {
        throw new Error(`Unexpected: ${transitionToString(transition)}`);
      }
    });

    return parseable;
  }

  private handleEpsilonTransition = (transition: Transition, index: number): void => {
    this.parseAndCollectTokenSuggestions(transition.target, index + 1);
  };

  private handleAtomicTransition(transition: AtomTransition, index: number): void {
    const nextToken = this.inputTokens.slice(index, index + 1)[0];
    const nextTokenType = nextToken?.type;

    if (nextTokenType === undefined) {
      return;
    }

    const nextTokenMatchesTransition = transition.label.contains(nextTokenType);

    if (!nextTokenMatchesTransition) {
      return;
    }

    this.parseAndCollectTokenSuggestions(transition.target, index + 1);
  }

  private handleSetTransition(transition: SetTransition, index: number) {
    const nextToken = this.inputTokens.slice(index, index + 1)[0];
    const nextTokenType = nextToken?.type;

    if (nextTokenType === undefined) {
      return;
    }

    transition.label.intervals.forEach((interval) => {
      for (let transitionTokenType = interval.start; transitionTokenType <= interval.stop; transitionTokenType += 1) {
        const nextTokenMatchesTransition = transitionTokenType === nextTokenType;

        if (nextTokenMatchesTransition) {
          this.parseAndCollectTokenSuggestions(transition.target, index + 1);
        }
      }
    });
  }
}
