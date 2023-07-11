import { FileNameConverter } from '$cli/utils/file-name/types/file-name-converter';

export class CamelKebabConverter implements FileNameConverter {
  convert(fileName: string): string {
    return fileName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  isAcceptable(fileName: string): boolean {
    return /^([a-z][a-zA-Z0-9]*).*$/.test(fileName);
  }
}
