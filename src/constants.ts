import {getInput} from '@actions/core';
import {join, sep} from 'path';

export const homeDir: string = join(process.cwd(), getInput('source'), sep);

export const pattern: string = getInput('pattern') ?? '**'.concat(sep, '*.*');

export {getInput};
