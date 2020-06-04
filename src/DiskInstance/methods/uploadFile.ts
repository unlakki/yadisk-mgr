import Crypto from 'crypto';
import fetch from 'node-fetch';
import { authorizedFetch } from '../utils/fetch';
import getResourceMetadata from './getResourceMetadata';
import createDir from './createDir';

export interface UploadFileOptions {
  dir?: string;
  name?: string;
  ext?: string;
}

const getUploadTargetUrl = async (path: string, accessToken: string) => {
  const res = await authorizedFetch<{ href: string }>('/resources/upload', accessToken, {
    method: 'GET',
    queryParams: {
      path,
    },
  });

  return res.href;
};

const getDir = (dir?: string) => (
  dir?.replace(/^\/?(.*)/, '$1')
);

const getTimeHash = () => (
  Crypto.createHash('sha1').update(Date.now().toString()).digest('hex').substr(0, 16)
);

const getFileHash = (file: Buffer) => (
  Crypto.createHash('sha1').update(file).digest('hex').substr(0, 16)
);

const getExt = (extension?: string) => (
 extension?.replace(/\.?(.*)$/, '.$1') ?? ''
);

const uploadFile = (accessToken: string) => (
  async (buffer: Buffer, options?: UploadFileOptions) => {
    if (options?.dir === '') {
      throw new Error('Parameter `dir` cannot be empty.');
    }

    if (options?.name === '') {
      throw new Error('Parameter `name` cannot be empty.');
    }

    if (options?.ext === '') {
      throw new Error('Parameter `ext` cannot be empty.');
    }

    const hash = getFileHash(buffer);

    const dir = getDir(options?.dir) || hash;
    const name = options?.name || (options?.dir ? hash : getTimeHash());
    const ext = getExt(options?.ext);

    try {
      await getResourceMetadata(accessToken)(dir);
    } catch (e) {
      if (!e.message.match(/resource not found/i)) {
        throw e;
      }

      await createDir(accessToken)(dir);
    }

    const pathToSave = `/${dir}/${name}${ext}`;

    const uploadTargetUrl = await getUploadTargetUrl(pathToSave, accessToken);
    await fetch(uploadTargetUrl, { method: 'PUT', body: buffer });

    return pathToSave;
  }
);

export default uploadFile;
