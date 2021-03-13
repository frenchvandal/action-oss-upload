import {getInput, info, setFailed} from '@actions/core';
import {create, Globber} from '@actions/glob';
import OSS, {Options, PutObjectResult} from 'ali-oss';
import {join, posix, sep} from 'path';
import {rmRF} from '@actions/io';

const isWindows: boolean = process.platform === 'win32';

const homeDir: string = join(process.cwd(), getInput('source'), sep);

const pattern: string = `**${sep}*.*`;

const credentials: Options = {
  accessKeyId: getInput('accessKeyId'),
  accessKeySecret: getInput('accessKeySecret'),
  bucket: getInput('bucket'),
  region: getInput('region'),
};

const client: OSS = new OSS(credentials);

async function upload(): Promise<void> {
  try {
    info(`\u001b[38;5;6m>>homeDir: ${homeDir}`);
    info(`\u001b[38;5;6m>>pattern: ${pattern}`);
    let index: number = 0;
    let percent: number = 0;
    const uploadDir: Globber = await create(`${homeDir}${pattern}`);
    const size: number = (await uploadDir.glob()).length;
    const localFiles: AsyncGenerator<
      string,
      void,
      unknown
    > = uploadDir.globGenerator();

    info(`${size} files to upload`);

    await rmRF(`${homeDir}browserconfig.xml`);

    for await (const file of localFiles) {
      let objectName: string = file.replace(homeDir, '');
      if (isWindows) {
        objectName = objectName.replace(
          new RegExp(`\\${sep}`, 'g'),
          `${posix.sep}`,
        );
      }

      try {
        index++;
        percent = (index / size) * 100;
        const response: PutObjectResult = await client.put(objectName, file);
        info(
          `\u001b[38;5;6m>> [${index}/${size}, ${percent.toFixed(
            2,
          )}%] uploaded: ${response.name}`,
        );
      } catch (err) {
        if (err.code === 'ENOENT') {
          const {warning} = await import('@actions/core');
          warning(
            `\u001b[38;5;6m>> [${index}/${size}, ${percent.toFixed(
              2,
            )}%] No such file ${file}`,
          );
        } else {
          const {error} = await import('@actions/core');
          error(err.message);
        }
      }
    }
    info(`${index} files uploaded`);
  } catch (error) {
    setFailed(error.message);
  }
}

upload();
