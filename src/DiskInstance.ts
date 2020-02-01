import { Stream } from 'stream';
import Crypto from 'crypto';
import QueryString from 'querystring';
import Bluebird from 'bluebird';
import request from 'request-promise';
import { StatusCodeError } from 'request-promise/errors';
import streamToBuffer from './utils/streamToBuffer';
import bufferToStream from './utils/bufferToStream';
import DiskManagerError from './errors/DiskManagerError';

export enum SortBy {
  Name = 'name',
  Path = 'path',
  Created = 'created',
  Modified = 'modified',
  Size = 'size',
}

export enum ResourceType {
  Dir = 'dir',
  File = 'file',
}

interface YandexDiskResource {
  name: string;
  type: ResourceType;
  media_type?: string;
  size?: number;
  created: string;
  modified: string;
}

type YandexDiskResponseItems = YandexDiskResource[] | undefined;

export interface Resource {
  name: string;
  type: ResourceType;
  mediaType?: string;
  size?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DiskStatus {
  id?: string;
  totalSpace: number;
  usedSpace: number;
  maxFileSize?: number;
}

export interface DirListOptions {
  offset: number;
  limit: number;
  sort: SortBy;
}

export interface UploadFileOptions {
  fileName?: string;
  path?: string;
  extension?: string;
}

export default class DiskInstance {
  private static readonly BASE_API_URL = 'https://cloud-api.yandex.net/v1/disk';

  private _token: string;

  constructor(token: string) {
    this._token = token;
  }

  public get token(): string {
    return this._token;
  }

  public async getStatus(): Promise<DiskStatus> {
    try {
      const res = await request(DiskInstance.BASE_API_URL, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this._token}`,
        },
      });

      const {
        total_space: totalSpace,
        used_space: usedSpace,
        max_file_size: maxFileSize,
        user,
      } = JSON.parse(res);

      return {
        id: user.uid, totalSpace, usedSpace, maxFileSize,
      };
    } catch (e) {
      if (e instanceof StatusCodeError) {
        switch (e.statusCode) {
          case 401:
            throw new DiskManagerError('Could not connect to API.');
          default:
            throw new DiskManagerError(JSON.parse(e.error).description);
        }
      }

      throw new DiskManagerError('Unknown error.');
    }
  }

  public async createDir(path: string): Promise<string> {
    const query = QueryString.stringify({ path });
    const uri = `${DiskInstance.BASE_API_URL}/resources?${query}`;

    try {
      const res = await request(uri, {
        method: 'PUT',
        headers: {
          authorization: `OAuth ${this._token}`,
        },
      });

      return JSON.parse(res).href;
    } catch (e) {
      if (e instanceof StatusCodeError) {
        switch (e.statusCode) {
          case 401:
            throw new DiskManagerError('Could not connect to API.');
          case 409:
            throw new DiskManagerError('Resource already exists.');
          default:
            throw new DiskManagerError(JSON.parse(e.error).description);
        }
      }

      throw new DiskManagerError('Unknown error.');
    }
  }

  public async getDirList(
    path: string,
    options: DirListOptions = { offset: 0, limit: 20, sort: SortBy.Created },
  ): Promise<Resource[]> {
    const fields = [
      'sort',
      ...[
        'name',
        'size',
        'type',
        'media_type',
        'created',
        'modified',
      ].map((field) => `items.${field}`),
    ].map((field) => `_embedded.${field}`).join(',');

    const query = QueryString.stringify({
      path,
      ...options,
      fields,
    });
    const uri = `${DiskInstance.BASE_API_URL}/resources?${query}`;

    try {
      const res = await request(uri, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this._token}`,
        },
      });

      const items = JSON.parse(res)?._embedded?.items as YandexDiskResponseItems;
      if (!items) {
        throw new DiskManagerError('Resource is not a directory.');
      }

      return items.map(({
        created, modified, media_type: mediaType, ...itemData
      }) => {
        const item: Resource = {
          ...itemData,
          createdAt: new Date(created),
          updatedAt: new Date(modified),
        };

        if (mediaType) {
          item.mediaType = mediaType;
        }

        return item;
      });
    } catch (e) {
      if (e instanceof DiskManagerError) {
        throw e;
      }

      if (e instanceof StatusCodeError) {
        switch (e.statusCode) {
          case 401:
            throw new DiskManagerError('Could not connect to API.');
          default: {
            throw new DiskManagerError(JSON.parse(e.error).description);
          }
        }
      }

      throw new DiskManagerError('Unknown error.');
    }
  }

  public async getFileLink(path: string): Promise<string> {
    const query = QueryString.stringify({ path });
    const uri = `${DiskInstance.BASE_API_URL}/resources/download?${query}`;

    try {
      const res = await request(uri, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this._token}`,
        },
      });

      const { href } = JSON.parse(res);
      if (!href) {
        throw new DiskManagerError('Unable to get link for disk instance.');
      }

      return href;
    } catch (e) {
      if (e instanceof DiskManagerError) {
        throw e;
      }

      if (e instanceof StatusCodeError) {
        switch (e.statusCode) {
          case 401:
            throw new DiskManagerError('Could not connect to API.');
          default:
            throw new DiskManagerError(JSON.parse(e.error).description);
        }
      }

      throw new DiskManagerError('Unknown error.');
    }
  }

  public async uploadFile(stream: Stream, options?: UploadFileOptions): Promise<string> {
    const buffer = await streamToBuffer(stream);

    const fileName = options?.fileName
      || Crypto.createHash('sha256').update(buffer).digest('hex');

    let extension = options?.extension;
    if (extension) {
      extension = `${extension.startsWith('.') ? '' : '.'}${extension}`;
    }

    const file = `${fileName}${extension || ''}`;
    const path = `${options?.path || ''}${options?.path?.endsWith('/') ? '' : '/'}${file}`;

    const query = QueryString.stringify({ path });
    const uri = `${DiskInstance.BASE_API_URL}/resources/upload/?${query}`;

    try {
      const res = await request(uri, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this._token}`,
        },
      });

      return new Bluebird((resolve, reject) => {
        bufferToStream(buffer).pipe(request.put(JSON.parse(res).href))
          .on('complete', () => {
            resolve(path);
          })
          .on('error', () => {
            reject(new DiskManagerError('Error while upload.'));
          });
      });
    } catch (e) {
      if (e instanceof StatusCodeError) {
        switch (e.statusCode) {
          case 401:
            throw new DiskManagerError('Could not connect to API.');
          default:
            throw new DiskManagerError(JSON.parse(e.error).description);
        }
      }

      throw new DiskManagerError('Unknown error.');
    }
  }

  public async removeFile(path: string): Promise<boolean> {
    const query = QueryString.stringify({
      path,
      permanently: true,
    });
    const uri = `${DiskInstance.BASE_API_URL}/resources?${query}`;

    try {
      await request(uri, {
        method: 'DELETE',
        headers: {
          authorization: `OAuth ${this._token}`,
        },
      });

      return true;
    } catch (e) {
      if (e instanceof StatusCodeError) {
        switch (e.statusCode) {
          case 401:
            throw new DiskManagerError('Could not connect to API.');
          case 409:
            throw new DiskManagerError('Unable to remove disk instance.');
          default:
            throw new DiskManagerError(JSON.parse(e.error).description);
        }
      }

      throw new DiskManagerError('Unknown error.');
    }
  }
}
