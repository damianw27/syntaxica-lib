#!/usr/bin/env node

import { program } from 'commander';
import { generate } from '$cli/commands/generate';

program.command('generate').description('Generate ANTLR4 source for grammars in configuration file').action(generate);
program.parse();

export * from '$cli/types/cli-config';
