import { endGroup, getInput, info, startGroup } from '@actions/core';
import { create, Globber } from '@actions/glob';
import OSS, { Options, PutObjectResult } from 'ali-oss';
import { join, posix, sep, win32 } from 'path';

const processSlash: string = sep;

const homeDir: string = join(
  process.cwd(),
  getInput('source') || 'public',
  processSlash,
);
const pattern: string = `**${processSlash}*.*`;

const credentials: Options = {
  accessKeyId: getInput('accessKeyId'),
  accessKeySecret: getInput('accessKeySecret'),
  bucket: getInput('bucket'),
  region: getInput('region'),
};

const client: OSS = new OSS(credentials);

const upload = async () => {
  try {
    let index: number = 0;
    let percent: number = 0;

    const uploadDir: Globber = await create(`${homeDir}${pattern}`);
    const size: number = (await uploadDir.glob()).length;
    const localFiles: AsyncGenerator<
      string,
      void,
      unknown
    > = uploadDir.globGenerator();

    const isWindows: boolean = process.platform === 'win32';
    const backwardSlash: string = win32.sep;
    const forwardSlash: string = posix.sep;

    startGroup(`\u001b[38;2;252,127,0m${size} files to upload`);
    for await (const file of localFiles) {
      let objectName: string = file.replace(homeDir, '');

      if (isWindows) {
        objectName = objectName.replace(
          new RegExp(`\\${backwardSlash}`, 'g'),
          `${forwardSlash}`,
        );
      }

      const response: PutObjectResult = await client.put(objectName, file);

      index += 1;
      percent = (index / size) * 100;

      info(
        `\u001b[38;2;0;128;0m[${index}/${size}, ${percent.toFixed(
          2,
        )}%] uploaded: ${response.name}`,
      );
    }
    endGroup();

    info(`\u001b[38;2;0;128;0m${index} files uploaded`);
  } catch (error) {
    const { setFailed } = await import('@actions/core');
    setFailed(error.message);
  }
};

upload();
