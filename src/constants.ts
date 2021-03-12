import {Config} from '@alicloud/oss-client';
import {getInput} from '@actions/core';
import {join, sep} from 'path';

export const credentials: Config = new Config({
  bucket: getInput('bucket'),
  region: getInput('region'),
  accessKeyId: getInput('accessKeyId'),
  accessKeySecret: getInput('accessKeySecret'),
});

export const homeDir: string = join(process.cwd(), getInput('source'), sep);

export const pattern: string = getInput('pattern') ?? '**'.concat(sep, '*.*');
