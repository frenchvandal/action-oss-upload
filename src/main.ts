import { getInput, info, toPosixPath, getIDToken } from '@actions/core';
import { exec } from '@actions/exec';
import { create, Globber } from '@actions/glob';
import OSS, { Options, PutObjectResult } from 'ali-oss';
import { join, relative, sep } from 'path';

const homeDir: string = join(process.cwd(), getInput('source'), sep);

const credentials: Options = {
  accessKeyId: getInput('accessKeyId', { required: true }),
  accessKeySecret: getInput('accessKeySecret', { required: true }),
  bucket: getInput('bucket', { required: true }),
  region: getInput('region', { required: true }),
};

const client: OSS = new OSS(credentials);

(async (): Promise<void> => {
  try {
    let index = 0;
    let percent = 0;

    const uploadDir: Globber = await create(homeDir, {
      matchDirectories: false,
    });
    const localFiles: AsyncGenerator<string, void, unknown> =
      uploadDir.globGenerator();
    const size: number = (await uploadDir.glob()).length;

    info(`${size} files to upload`);

    for await (const file of localFiles) {
      const response: PutObjectResult = await client.put(
        toPosixPath(relative(homeDir, file)),
        file,
      );

      index += 1;
      percent = (index / size) * 100;

      info(
        `[${index}/${size}, ${percent.toFixed(2)}%] uploaded: ${response.name}`,
      );

      await exec(
        `aliyun Cdn RefreshObjectCaches --ObjectPath https://frenchvandal.cn/${toPosixPath(
          relative(homeDir, file),
        )} --ObjectType file`,
      );

      await exec(
        `aliyun Cdn PushObjectCache --ObjectPath https://frenchvandal.cn/${toPosixPath(
          relative(homeDir, file),
        )} --Area overseas --L2Preload true`,
      );
    }

    const idToken = await getIDToken();
    info('id token:');
    info(idToken);

    info(`${index} files uploaded`);
  } catch (err: any) {
    const { warning } = await import('@actions/core');
    warning(err.message);
  }
})();
