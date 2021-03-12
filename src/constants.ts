import {getInput} from '@actions/core';
import {join, sep} from 'path';
import {IOptions} from 'ali-oss/lib/types/params';

export const credentials: IOptions = {
  bucket: getInput('bucket'),
  region: getInput('region'),
  accessKeyId: getInput('accessKeyId'),
  accessKeySecret: getInput('accessKeySecret'),
};

export const homeDir: string = join(process.cwd(), getInput('source'), sep);

export const pattern: string = getInput('pattern') ?? '**'.concat(sep, '*.*');
