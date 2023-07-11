import { execSync } from 'child_process';
import { resolve } from 'path';
import { readFileSync, writeFileSync, rmSync, readdirSync, mkdirSync } from 'fs';
import { loadConfig } from '$cli/utils/config-util';
import { convertToKebabCase, removeExtension } from '$cli/utils/file-name/file-name-util';

const extensionsToDelete = ['interp', 'tokens'];

const REGEX_SPEC_CHARS_REGEX = /[.*+\-?^${}()|[\]\\]/g;
const ESCAPED_CHAR_PATTERN = '\\$&';

export const generate = async (): Promise<void> => {
  const config = loadConfig();

  console.log('Cleaning output directory...');

  const grammarsRoot = resolve(process.cwd(), config.grammarsRoot);
  const sourcesRoot = resolve(process.cwd(), config.sourceOutputRoot);
  const generatedFileExtension = config.target === 'JavaScript' ? 'js' : 'ts';

  try {
    rmSync(sourcesRoot, { recursive: true, force: true });
    mkdirSync(sourcesRoot);
  } catch (error) {
    console.log('Unable to clean up sources root.');
  }

  console.log('Generating source from ANTLR grammar...');

  let generatedGrammarsCount = 0;

  config.grammars.forEach((grammarEntry) => {
    const grammarName = grammarEntry.name;

    const sources = grammarEntry.fileNames
      .map((fileName) => `-o ${sourcesRoot}/${grammarName}/ ${grammarsRoot}/${grammarName}/${fileName}`)
      .join(' ');

    const command = `antlr4 -Dlanguage=${config.target} ${sources}`;

    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Unable to generate sources for grammar: ${grammarName}`);
    }

    generatedGrammarsCount += 1;
    console.log(`Generation in progress: ${(generatedGrammarsCount / config.grammars.length) * 100}%`);
  });

  console.log('Cleaning output sources after generation...');

  let cleanedUpFiles = 0;

  config.grammars.forEach((grammarEntry) => {
    const grammarName = grammarEntry.name;
    const generatedFiles = readdirSync(`${sourcesRoot}/${grammarName}/`);

    generatedFiles
      .filter((fileName) => extensionsToDelete.some((extension) => fileName.endsWith(`.${extension}`)))
      .forEach((fileName) => rmSync(`${sourcesRoot}/${grammarName}/${fileName}`));

    cleanedUpFiles += 1;
    console.log(`Cleanup in progress: ${(cleanedUpFiles / config.grammars.length) * 100}%`);
  });

  console.log('Transforming generated sources...');

  let transformedFilesCount = 0;

  config.grammars.forEach((grammarEntry) => {
    const grammarName = grammarEntry.name;
    const generatedFiles = readdirSync(`${sourcesRoot}/${grammarName}/`);

    generatedFiles.forEach((fileName) => {
      if (!fileName.endsWith(`.${generatedFileExtension}`)) {
        return;
      }

      const sourcePath = `${sourcesRoot}/${grammarName}/${fileName}`;
      const newFileName = convertToKebabCase(fileName);

      try {
        let sourceContent = readFileSync(sourcePath, 'utf-8').replace(/['"]antlr4['"]/g, "'@syntaxica/antlr'");

        generatedFiles.forEach((subFileName) => {
          const fileNameWithNoExtension = removeExtension(subFileName).replace(
            REGEX_SPEC_CHARS_REGEX,
            ESCAPED_CHAR_PATTERN,
          );

          const fileNameJavaScript = `${fileNameWithNoExtension}.js`.replace(
            REGEX_SPEC_CHARS_REGEX,
            ESCAPED_CHAR_PATTERN,
          );

          const fileNameTypeScript = `${fileNameWithNoExtension}.ts`.replace(
            REGEX_SPEC_CHARS_REGEX,
            ESCAPED_CHAR_PATTERN,
          );

          const newSubFileName = `'./${removeExtension(convertToKebabCase(subFileName))}'`;

          const replaceRegExp = new RegExp(
            `['"]\\.\\/(${fileNameWithNoExtension}|${fileNameJavaScript}|${fileNameTypeScript})['"]`,
            'g',
          );

          sourceContent = sourceContent.replace(replaceRegExp, newSubFileName);
        });

        const newSourcePath = `${sourcesRoot}/${grammarName}/${newFileName}`;

        writeFileSync(newSourcePath, sourceContent);
        rmSync(sourcePath);

        if (config.eslintConfig !== undefined) {
          execSync(`npx eslint ${newSourcePath} --fix --no-ignore --quiet -c ${config.eslintConfig}`, {
            stdio: 'inherit',
          });
        }
      } catch (error: any) {
        console.log(`Unable to transform file '${sourcePath}': ${error.message}`);
      }
    });

    transformedFilesCount += 1;
    console.log(`Transformation in progress: ${(transformedFilesCount / config.grammars.length) * 100}%`);
  });

  console.log('Successfully generated parser sources.');
};
