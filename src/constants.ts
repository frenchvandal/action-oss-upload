import OSS, {Options} from 'ali-oss';
import {getInput} from '@actions/core';
import {join} from 'path';

export const credentials: Options = {
  bucket: getInput('bucket'),
  region: getInput('region'),
  accessKeyId: getInput('accessKeyId'),
  accessKeySecret: getInput('accessKeySecret')
};

export const homeDir: string = join(process.cwd(), getInput('source'));
