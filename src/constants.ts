import {getInput} from '@actions/core';
import {posix} from 'path';

export const homeDir: string = posix.join(
  posix.normalize(process.cwd()),
  getInput('source'),
  posix.sep,
);

export const pattern: string = '**'.concat(posix.sep, '*.*');

export {getInput, posix};
