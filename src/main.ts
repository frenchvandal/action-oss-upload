import {info, setFailed} from '@actions/core';
import {create as createGlobber, Globber} from '@actions/glob';
import {getInput, homeDir, pattern} from './constants';
import {ObjectPutReturnType} from 'ali-oss/lib/types/object';
import {IOptions} from 'ali-oss/lib/types/params';
import Client from 'ali-oss';

const isWindows: boolean = process.platform === 'win32';

const credentials: IOptions = {
  accessKeyId: getInput('accessKeyId'),
  accessKeySecret: getInput('accessKeySecret'),
  bucket: getInput('bucket'),
  region: getInput('region'),
};

async function upload(): Promise<void> {
  try {
    const client: Client = new Client(credentials);
    const uploadDir: Globber = await createGlobber(homeDir.concat(pattern));
    let localFiles: string[] = await uploadDir.glob();
    if (isWindows) {
      localFiles = localFiles.map((item) => item.replace(/\\/g, '/'));
    }
    const size: number = localFiles.length;
    let index: number = 0;
    let percent: number = 0;
    info(`${size} files to upload`);
    for await (const file of localFiles) {
      const objectName: string = file.replace(homeDir, '');
      const response: ObjectPutReturnType = await client.put(objectName, file);
      index++;
      percent = (index / size) * 100;
      info(
        `\u001b[38;5;6m>> [${index}/${size}, ${percent.toFixed(
          2,
        )}%] uploaded: ${response.name}`,
      );
    }
    info(`${index} files uploaded`);
  } catch (e) {
    setFailed(e.message);
  }
}

upload();
