import { Stream, Duplex } from 'stream';
import Crypto from 'crypto';
import DiskInstance, { DiskStatus, SortBy, Resource } from './DiskInstance';

export default class DiskManager {
  private instances = new Map<string, DiskInstance>();

  constructor(tokens: Array<string>) {
    tokens.forEach((token) => {
      const id = Crypto.createHash('md5').update(token).digest('hex');
      this.instances.set(id, new DiskInstance(token));
    });
  }

  public addInstance(token: string): void {
    const id = Crypto.createHash('md5').update(token).digest('hex');

    if (id in this.instances) {
      throw new Error ('Disk instance already exists.');
    }

    this.instances.set(id, new DiskInstance(token));
  }

  public removeInstance(id: string): void {
    if (!this.instances.has(id)) {
      throw new Error ('Disk instance not found.');
    }

    this.instances.delete(id);
  }

  public async getStatus(): Promise<DiskStatus> {
    const promises = Array.from(this.instances.values()).map(async (instance) => {
      const { totalSpace, usedSpace } = await instance.getStatus();

      return { totalSpace, usedSpace };
    });

    const status = await Promise.all(promises);

    return status.reduce(({ totalSpace, usedSpace }, value) => ({
      totalSpace: totalSpace + value.totalSpace,
      usedSpace: usedSpace + value.usedSpace,
    }));
  }

  public async getDirList(
    path: string,
    offset = 0,
    limit = 20,
    sort: SortBy = SortBy.Created,
  ): Promise<Array<Resource>> {
    if (path === '/') {
      const promises = Array.from(this.instances.values()).map(async (instance) => {
        const { usedSpace } = await instance.getStatus();

        return {
          name: Crypto.createHash('md5').update(instance.getToken()).digest('hex'),
          type: 'dir',
          size: usedSpace,
        } as Resource;
      });

      const status = await Promise.all(promises);
      return status;
    }

    try {
      const paths = path.slice(1).split('/');

      const id = paths.shift();
      if (!id) {
        throw new Error('Incorrect path.');
      }

      const instance = this.instances.get(id);
      if (!instance) {
        throw new Error('Disk instance not found.');
      }

      const res = await instance.getDirList(
        paths.join('/') || '/', offset, limit, sort,
      );

      return res;
    } catch (e) {
      throw e;
    }
  }

  public async getFileLink(path: string): Promise<{ url: string }> {
    try {
      const paths = path.slice(1).split('/');

      const id = paths.shift();
      if (!id) {
        throw new Error('Incorrect path.');
      }

      const instance = this.instances.get(id);
      if (!instance) {
        throw new Error('Disk instance not found.');
      }

      const url = await instance.getFileLink(paths.join('/') || '/');

      return { url };
    } catch (e) {
      throw e;
    }
  }

  public uploadFile(stream: Stream, extension: string): Promise<{ path: string }> {
    return new Promise((resolve, reject): void => {
      const chunks: Array<Uint8Array> = [];

      stream.on('data', (chunk: Uint8Array): void => {
        chunks.push(chunk);
      });

      stream.on('end', async (): Promise<void> => {
        const buffer = Buffer.concat(chunks);

        const promises = Array.from(this.instances.values()).map(async (instance) => {
          const { totalSpace, usedSpace } = await instance.getStatus();

          return {
            id: Crypto.createHash('md5').update(instance.getToken()).digest('hex'),
            freeSpace: totalSpace - usedSpace,
          };
        });

        const instances = await Promise.all(promises);
        const { id, freeSpace } = instances.sort((a, b) => b.freeSpace - a.freeSpace)[0];

        if (freeSpace < buffer.length) {
          reject(new Error('Not enough space.'));
          return;
        }

        const hash = Crypto.createHash('sha256').update(buffer).digest('hex');
        const file = `/${hash}${extension ? `.${extension}` : ''}`;

        try {
          const stream = new Duplex();

          stream.push(buffer);
          stream.push(null);

          const instance = this.instances.get(id);

          if (!instance) {
            throw new Error('Disk instance not found.');
          }

          await instance.uploadFile(file, stream);

          resolve({ path: `/${id}${file}` });
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  public async removeFile(path: string): Promise<boolean> {
    try {
      const paths = path.slice(1).split('/');

      const instance = this.instances.get(paths.shift() as string);

      if (!instance) {
        throw new Error('Incorrect path.');
      }

      const res = await instance.removeFile(paths.join('/'));

      return res;
    } catch (e) {
      switch (e.message) {
        case 'Error validating field "path": This field is required.':
          throw new Error('Unable to remove disk instance.');
        case 'Cannot read property \'removeFile\' of undefined':
          throw new Error('Disk instance not found.');
        default: {
          throw e;
        }
      }
    }
  }
}
