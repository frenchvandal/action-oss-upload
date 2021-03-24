import { endGroup, getInput, info, startGroup } from '@actions/core';
import { create, Globber } from '@actions/glob';
import OSS, { Options, PutObjectResult } from 'ali-oss';
import { join, posix, sep } from 'path';

const isWindows: boolean = process.platform === 'win32';

const processSlash: string = sep;

const homeDir: string = join(
  process.cwd(),
  getInput('source', { required: false }) || 'public',
  processSlash,
);

const credentials: Options = {
  accessKeyId: getInput('accessKeyId', { required: true }),
  accessKeySecret: getInput('accessKeySecret', { required: true }),
  bucket: getInput('bucket', { required: true }),
  region: getInput('region', { required: true }),
};

const client: OSS = new OSS(credentials);

function objectify(filePath: string): string {
  let fileToObject: string = filePath.replace(homeDir, '');

  if (isWindows) {
    //fileToObject = fileToObject.split(processSlash).join(posix.sep);
    fileToObject = posix.normalize(fileToObject);
  }

  return fileToObject;
}

(async (): Promise<void> => {
  try {
    let index = 0;
    let percent = 0;

    const uploadDir: Globber = await create(`${homeDir}**${processSlash}*.*`);
    const size: number = (await uploadDir.glob()).length;
    const localFiles: AsyncGenerator<
      string,
      void,
      unknown
    > = uploadDir.globGenerator();

    //startGroup(`${size} files to upload`);
    for await (const file of localFiles) {
      const objectName: string = objectify(file);

      //const response: PutObjectResult = await client.put(objectName, file);

      index += 1;
      percent = (index / size) * 100;

      info(
        `\u001b[38;2;0;128;0m[${index}/${size}, ${percent.toFixed(
          2,
        )}%] uploaded: ${objectName}`,
      );
    }
    //endGroup();

    info(`${index} files uploaded`);
  } catch (error) {
    const { setFailed } = await import('@actions/core');
    setFailed(error.message);
  }
})();
