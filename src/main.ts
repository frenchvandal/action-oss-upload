import OSS, {PutObjectResult} from 'ali-oss';
import {info, setFailed} from '@actions/core';
import {create as createGlobber, Globber} from '@actions/glob';
import {credentials, homeDir} from './constants';
import {join} from 'path';

async function upload(): Promise<void> {
  try {
    const client: OSS = new OSS(credentials);
    const uploadDir: Globber = await createGlobber(join(homeDir, '**/*.*'));
    const localFiles: string[] = await uploadDir.glob();
    const size: number = localFiles.length;
    let index: number = 0;
    let percent: number = 0;
    info(`${size} files to upload ⬆️`);
    for await (const file of localFiles) {
      const objectName: string = file.replace(homeDir, '');
      const response: PutObjectResult = await client.put(objectName, file);
      index++;
      percent = (index / size) * 100;
      info(`\u001b[38;5;6m>> [${index}/${size}, ${percent.toFixed(2)}%] uploaded: ${response.name}`);
    };
    info(`${index} files uploaded ✅`);
  } catch (e) {
    setFailed(e.message);
  }
}

upload();
