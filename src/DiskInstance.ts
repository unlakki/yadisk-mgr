/* eslint-disable @typescript-eslint/camelcase */

import Bluebird from 'bluebird';
import request from 'request-promise';
import { Stream } from 'stream';

export interface DiskStatus {
  id?: string;
  totalSpace: number;
  usedSpace: number;
  maxFileSize?: number;
}

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

export interface Resource {
  type: ResourceType;
  name: string;
  created?: Date;
  modified?: Date;
  media_type?: string;
  size?: number;
}

export default class DiskInstance {
  private static readonly baseUrl: string = 'https://cloud-api.yandex.net/v1/disk';

  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  public getToken(): string {
    return this.token;
  }

  public async getStatus(): Promise<DiskStatus> {
    try {
      const res = await request(DiskInstance.baseUrl, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      const {
        user, total_space, used_space, max_file_size,
      } = JSON.parse(res);

      return {
        id: user.uid, totalSpace: total_space, usedSpace: used_space, maxFileSize: max_file_size,
      };
    } catch (e) {
      if (e.message.includes('ENOTFOUND')) {
        throw new Error('Could not connect to API.');
      }

      throw new Error(JSON.parse(e.error).description);
    }
  }

  public async createDir(path: string): Promise<string> {
    const uri = `${DiskInstance.baseUrl}/resources?path=${encodeURI(path)}`;

    try {
      const res = await request(uri, {
        method: 'PUT',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      return JSON.parse(res).href;
    } catch (e) {
      if (e.message.includes('ENOTFOUND')) {
        throw new Error('Could not connect to API.');
      }

      throw new Error(JSON.parse(e.error).description);
    }
  }

  public async getDirList(
    path: string,
    offset = 0,
    limit = 20,
    sort: SortBy = SortBy.Created,
  ): Promise<Array<Resource>> {
    const fileds = [
      '_embedded.sort',
      '_embedded.items.name',
      '_embedded.items.size',
      '_embedded.items.type',
      '_embedded.items.media_type',
      '_embedded.items.created',
      '_embedded.items.modified',
    ].join(',');

    const uri = `${DiskInstance.baseUrl}/resources?path=${encodeURI(path)}&offset=${offset}&limit=${limit}&sort=${sort}&fields=${fileds}`;

    try {
      const res = await request(uri, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      return JSON.parse(res)._embedded.items; // eslint-disable-line no-underscore-dangle
    } catch (e) {
      if (e.message.includes('ENOTFOUND')) {
        throw new Error('Could not connect to API.');
      }

      switch (e.message) {
        case 'Cannot read property \'items\' of undefined':
          throw new Error('Resource not folder.');
        default:
          throw new Error(JSON.parse(e.error).description);
      }
    }
  }

  public async getFileLink(path: string): Promise<string> {
    const uri = `${DiskInstance.baseUrl}/resources/download?path=${encodeURI(path)}`;

    try {
      const res = await request(uri, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      const { href } = JSON.parse(res);

      if (!href) {
        throw new Error('Unable to get link for disk instance.');
      }

      return href;
    } catch (e) {
      if (e.message.includes('ENOTFOUND')) {
        throw new Error('Could not connect to API.');
      }

      const { error } = e;
      if (error) {
        throw new Error(JSON.parse(error).description);
      }

      throw e;
    }
  }

  public async uploadFile(path: string, stream: Stream): Promise<boolean> {
    const uri = `${DiskInstance.baseUrl}/resources/upload/?path=${encodeURI(path)}`;

    try {
      const res = await request(uri, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      return new Bluebird((resolve, reject): void => {
        const { href } = JSON.parse(res);

        stream.pipe(request.put(href))
          .on('complete', () => {
            resolve(true);
          })
          .on('error', () => {
            reject(new Error('Error while upload.'));
          });
      });
    } catch (e) {
      if (e.message.includes('ENOTFOUND')) {
        throw new Error('Could not connect to API.');
      }

      throw new Error(JSON.parse(e.error).description);
    }
  }

  public async removeFile(path: string): Promise<boolean> {
    const uri = `${DiskInstance.baseUrl}/resources?path=${encodeURI(path)}&permanently=true`;

    try {
      await request(uri, {
        method: 'DELETE',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      return true;
    } catch (e) {
      if (e.message.includes('ENOTFOUND')) {
        throw new Error('Could not connect to API.');
      }

      throw new Error(JSON.parse(e.error).description);
    }
  }
}
