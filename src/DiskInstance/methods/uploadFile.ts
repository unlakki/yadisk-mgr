import Crypto from 'crypto';
import fetch from 'node-fetch';
import { authorizedFetch } from '../utils/fetch';

export interface UploadFileOptions {
  fileName?: string;
  path?: string;
  extension?: string;
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

const getPath = (path?: string) => (
  path?.replace(/\/$/, '') ?? ''
);

const getFileName = (buffer: Buffer, fileName?: string) => (
  fileName || Crypto.createHash('sha256').update(buffer).digest('hex')
);

const getExtension = (extension?: string) => (
 extension?.replace(/^[^.]/, (char) => `.${char}`) ?? ''
);

const uploadFile = (accessToken: string) => (
  async (buffer: Buffer, options?: UploadFileOptions) => {
    const path = getPath(options?.path);
    const fileName = getFileName(buffer, options?.fileName);
    const ext = getExtension(options?.extension);

    const pathToSave = `${path}/${fileName}${ext}`;

    const uploadTargetUrl = await getUploadTargetUrl(pathToSave, accessToken);
    await fetch(uploadTargetUrl, { method: 'PUT', body: buffer });

    return pathToSave;
  }
);

export default uploadFile;
