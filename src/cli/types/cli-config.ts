export interface GrammarEntry {
  readonly name: string;
  readonly fileNames: string[];
}

export interface CliConfig {
  readonly target: 'JavaScript' | 'TypeScript';
  readonly grammarsRoot: string;
  readonly sourceOutputRoot: string;
  readonly eslintConfig?: string;
  readonly grammars: GrammarEntry[];
}
