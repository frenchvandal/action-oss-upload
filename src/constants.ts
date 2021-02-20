import {Options} from 'ali-oss';
import {getInput} from '@actions/core';
import {join, sep} from 'path';

export const credentials: Options = {
  bucket: getInput('bucket'),
  region: getInput('region'),
  accessKeyId: getInput('accessKeyId'),
  accessKeySecret: getInput('accessKeySecret')
};

export const homeDir: string = join(process.cwd(), getInput('source'), sep);

export const pattern: string = getInput('pattern') || '**'.concat(sep, '*.*');
