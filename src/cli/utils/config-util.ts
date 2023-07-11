import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { CliConfig } from '$cli/types/cli-config';

const possibleConfigFileNames = ['.syntaxicarc', '.syntaxicarc.json'];

export const loadConfig = (): CliConfig => {
  let config: CliConfig | undefined;

  possibleConfigFileNames.forEach((configFileName) => {
    const configFilePath = resolve(process.cwd(), configFileName);

    if (!existsSync(configFilePath)) {
      return;
    }

    const configFileContent = readFileSync(configFilePath, 'utf-8');
    config = JSON.parse(configFileContent) as CliConfig;
  });

  if (config === undefined) {
    throw new Error('Unable to load configuration file.');
  }

  return config;
};
