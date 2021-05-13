import { getInput, info } from '@actions/core';
import { create, Globber } from '@actions/glob';
import OSS, { Options, PutObjectResult } from 'ali-oss';
import { join, posix, sep } from 'path';

const processSlash: string = sep;

const homeDir: string = join(process.cwd(), getInput('source'), processSlash);

const credentials: Options = {
  accessKeyId: getInput('accessKeyId', { required: true }),
  accessKeySecret: getInput('accessKeySecret', { required: true }),
  bucket: getInput('bucket', { required: true }),
  region: getInput('region', { required: true }),
};

const client: OSS = new OSS(credentials);

function objectify(
  filePath: string,
  baseName?: string,
  prefix?: string,
): string {
  let fileToObject: string[] = filePath.split(processSlash);

  if (baseName) {
    const forDeletion: string[] = baseName.split(processSlash);
    fileToObject = fileToObject.filter((item) => !forDeletion.includes(item));
  }

  if (prefix) {
    fileToObject.unshift(prefix);
  }
  const objectFile: string = fileToObject.join(posix.sep);

  return objectFile;
}

(async (): Promise<void> => {
  try {
    let index = 0;
    let percent = 0;

    const uploadDir: Globber = await create(`${homeDir}**${processSlash}*.*`);
    const localFiles: string[] = await uploadDir.glob();
    localFiles.push('gagagagaga');
    const size: number = localFiles.length;

    info(`${size} files to upload`);

    const requests: Promise<OSS.PutObjectResult>[] = localFiles.map(
      async (file) => client.put(objectify(file, homeDir), file),
    );

    const responses: Promise<PromiseSettledResult<OSS.PutObjectResult>[]> =
      Promise.allSettled(requests);

    for (const resp of await responses) {
      info('console.log(resp)');
      info(' ');
      // eslint-disable-next-line no-console
      console.log(resp);
      info(' ');
    }

    info('console.log(responses)');
    // eslint-disable-next-line no-console
    console.log(responses);

    for await (const file of localFiles) {
      const objectName: string = objectify(file, homeDir);

      const response: PutObjectResult = await client.put(objectName, file);

      index += 1;
      percent = (index / size) * 100;

      info(
        `[${index}/${size}, ${percent.toFixed(2)}%] uploaded: ${response.name}`,
      );
    }

    info(`${index} files uploaded`);
  } catch (error) {
    const { warning } = await import('@actions/core');
    warning(error.message);
  }
})();
