export interface FileNameConverter {
  readonly convert: (fileName: string) => string;
  readonly isAcceptable: (fileName: string) => boolean;
}
