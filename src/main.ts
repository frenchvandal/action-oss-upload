import OSS, {PutObjectResult} from 'ali-oss';
import {info, setFailed} from '@actions/core';
import {create as createGlobber, Globber} from '@actions/glob';
import {credentials, homeDir, pattern} from './constants';
import {toNamespacedPath} from 'path';

const IS_WINDOWS: boolean = process.platform === 'win32';

async function upload(): Promise<void> {
  try {
    const client: OSS = new OSS(credentials);
    const uploadDir: Globber = await createGlobber(homeDir.concat(pattern));
    const localFiles: string[] = await uploadDir.glob();
    const size: number = localFiles.length;
    let index: number = 0;
    let percent: number = 0;
    info(`⬆️ ${size} files to upload`);
    for await (const file of localFiles) {
      let objectName: string = file.replace(homeDir, '');
      if (IS_WINDOWS) {
        objectName = objectName.replace(/\\/g, '/');
      }
      const response: PutObjectResult = await client.put(objectName, file);
      index++;
      percent = (index / size) * 100;
      info(`\u001b[38;5;6m>> [${index}/${size}, ${percent.toFixed(2)}%] uploaded: ${response.name}`);
    }
    info(`✅ ${index} files uploaded`);
  } catch (error) {
    setFailed(error.message);
  }
}

upload();
