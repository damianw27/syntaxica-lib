import { CamelKebabConverter } from '$cli/utils/file-name/strategies/camel-kebab-converter';
import { PascalKebabConverter } from '$cli/utils/file-name/strategies/pascal-kebab-converter';

const conversionStrategies = [new CamelKebabConverter(), new PascalKebabConverter()];

export const convertToKebabCase = (fileName: string): string => {
  const foundStrategy = conversionStrategies.find((strategy) => strategy.isAcceptable(fileName));

  if (foundStrategy === undefined) {
    return fileName;
  }

  return foundStrategy.convert(fileName);
};
