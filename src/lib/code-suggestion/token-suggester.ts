import { ATNState, AtomTransition, IntervalSet, Lexer, Transition } from '@syntaxica/antlr';
import { LexerWrapper } from '$lib/code-suggestion/lexer-wrapper';

export class TokenSuggester<L extends Lexer> {
  public origPartialToken: string;

  public lexerWrapper: LexerWrapper<L>;

  public suggestions: string[];

  public statesCache: number[];

  public casePreference: string | null;

  public constructor(origPartialToken: string, lexerWrapper: LexerWrapper<L>, casePreference: string | null = null) {
    this.origPartialToken = origPartialToken;
    this.lexerWrapper = lexerWrapper;
    this.suggestions = [];
    this.statesCache = [];
    this.casePreference = casePreference;
  }

  public suggest = (nextParserTransitionLabels: number[]): string[] => {
    nextParserTransitionLabels.forEach((label) => {
      const nextTokenRuleNumber = label - 1;
      const lexerState = this.lexerWrapper.findStateByRuleNumber(nextTokenRuleNumber);
      this.findSuggestionForState('', lexerState, this.origPartialToken);
    });

    return this.suggestions;
  };

  private findSuggestionForState = (tokenSoFar: string, state: ATNState, remainingText: string): void => {
    if (this.statesCache.includes(state.stateNumber)) {
      return;
    }

    this.statesCache.push(state.stateNumber);
    const tokenNotEmpty = tokenSoFar.length > 0;
    const noMoreCharactersInToken = state.transitions.length === 0;

    if (tokenNotEmpty && noMoreCharactersInToken) {
      this.addSuggestedToken(tokenSoFar);
    }

    state.transitions.forEach((transition) => {
      this.suggestViaLexerTransition(tokenSoFar, remainingText, transition);
    });
  };

  private addSuggestedToken = (tokenToAdd: string): void => {
    const justTheCompletionPart = this.chopOffCommonStart(tokenToAdd, this.origPartialToken);

    if (this.suggestions.includes(justTheCompletionPart)) {
      return;
    }

    this.suggestions.push(justTheCompletionPart);
  };

  private chopOffCommonStart = (tokenToAdd: string, origPartialToken: string): string => {
    const charsToChopOff = Math.min(tokenToAdd.length, origPartialToken.length);
    return tokenToAdd.substring(charsToChopOff, tokenToAdd.length - charsToChopOff);
  };

  private suggestViaLexerTransition = (tokenSoFar: string, remainingText: string, transition: Transition): void => {
    if (transition.isEpsilon) {
      this.findSuggestionForState(tokenSoFar, transition.target, remainingText);
    } else if (transition.serializationType === 5) {
      const newTokenChar = this.getAddedTextFor(transition as AtomTransition);

      if (remainingText === '' || remainingText.startsWith(newTokenChar)) {
        this.suggestViaNonEpsilonLexerTransition(tokenSoFar, remainingText, newTokenChar, transition.target);
      }
    } else if (transition.serializationType === 7) {
      const allLabelChars = this.calcAllLabelChars(transition.label);

      transition.label.intervals.forEach((interval) => {
        for (let codePoint = interval.start; codePoint < interval.stop; codePoint += 1) {
          const character = String.fromCodePoint(codePoint);
          const shouldIgnoreCase = this.shouldIgnoreThisCase(character, allLabelChars);
          const newTokenChar = String.fromCodePoint(codePoint);

          if (!shouldIgnoreCase && (remainingText === '' || remainingText.startsWith(newTokenChar))) {
            this.suggestViaNonEpsilonLexerTransition(tokenSoFar, remainingText, newTokenChar, transition.target);
          }
        }
      });
    }
  };

  private getAddedTextFor = (transition: AtomTransition): string => String.fromCodePoint(transition.label_);

  private suggestViaNonEpsilonLexerTransition = (
    tokenSoFar: string,
    remainingText: string,
    newTokenChar: string,
    target: ATNState,
  ): void => {
    const newRemainingText = remainingText.length > 0 ? remainingText.substring(1) : '';
    this.findSuggestionForState(tokenSoFar + newTokenChar, target, newRemainingText);
  };

  private calcAllLabelChars = (label: IntervalSet): string[] => {
    const allLabelChars: string[] = [];

    label.intervals.forEach((interval) => {
      for (let codePoint = interval.start; codePoint < interval.stop; codePoint += 1) {
        allLabelChars.push(String.fromCharCode(codePoint));
      }
    });

    return allLabelChars;
  };

  private shouldIgnoreThisCase = (character: string, allLabelChars: string[]): boolean => {
    if (this.casePreference === null || this.casePreference === 'BOTH') {
      return false;
    }

    const upper = character.toUpperCase();
    const lower = character.toLowerCase();

    switch (this.casePreference) {
      case 'LOWER':
        return character === upper && allLabelChars.includes(lower);
      case 'UPPER':
        return character === lower && allLabelChars.includes(upper);
      default:
        return false;
    }
  };
}
