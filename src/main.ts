import {info, setFailed} from '@actions/core';
import {create, Globber} from '@actions/glob';
import {getInput, homeDir, pattern, posix} from './constants';
import OSS, {Options, PutObjectResult} from 'ali-oss';

const credentials: Options = {
  accessKeyId: getInput('accessKeyId'),
  accessKeySecret: getInput('accessKeySecret'),
  bucket: getInput('bucket'),
  region: getInput('region'),
};

async function upload(): Promise<void> {
  try {
    //const client: OSS = new OSS(credentials);
    info(`\u001b[38;5;6m>>homeDir: ${homeDir}`);
    info(`\u001b[38;5;6m>>pattern: ${pattern}`);
    const uploadDir: Globber = await create(homeDir.concat(pattern));
    const size: number = (await uploadDir.glob()).length;
    let index: number = 0;
    let percent: number = 0;
    info(`${size} files to upload`);
    for await (const file of uploadDir.globGenerator()) {
      const objectName: string = posix.basename(file);
      info(objectName);
      //const response: PutObjectResult = await client.put(objectName, file);

      index++;
      percent = (index / size) * 100;
      info(
        `\u001b[38;5;6m>> [${index}/${size}, ${percent.toFixed(
          2,
        )}%] uploaded: ${objectName}`,
      );
    }
    info(`${index} files uploaded`);
  } catch (error) {
    setFailed(error.message);
  }
}

upload();
