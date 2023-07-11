import { SyntaxObject } from '$lib/grammar-builder/types/syntax-object';
import { SyntaxType } from '$lib/grammar-builder/types/syntax-type';

const COMMENT_BLOCK_REGEX = /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/;
const COMMENT_REGEX = /(^|[^\\:])\/\/.*/;
const STRING_REGEX = /(["'`])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

export class CommonSyntaxObjects {
  public static readonly CLikeComment: SyntaxObject = {
    pattern: [
      {
        pattern: COMMENT_BLOCK_REGEX,
        greedy: true,
      },
      {
        pattern: COMMENT_REGEX,
        greedy: true,
      },
    ],
    syntaxType: SyntaxType.Comment,
  };

  public static readonly String: SyntaxObject = {
    pattern: {
      pattern: STRING_REGEX,
      greedy: true,
    },
    syntaxType: SyntaxType.String,
  };
}
