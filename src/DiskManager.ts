import { Stream, Duplex } from 'stream';
import Crypto from 'crypto';
import DiskInstance, {
  SortBy,
  ResourceType,
  Resource,
  DiskStatus,
  DirListOptions,
} from './DiskInstance';
import DiskManagerError from './errors/DiskManagerError';

export default class DiskManager {
  private instances = new Map<string, DiskInstance>();

  constructor(tokenList: Array<string>) {
    tokenList.forEach((token) => {
      const id = Crypto.createHash('md5').update(token).digest('hex');
      this.instances.set(id, new DiskInstance(token));
    });
  }

  public addInstance(token: string) {
    const id = Crypto.createHash('md5').update(token).digest('hex');
    if (this.instances.has(id)) {
      throw new DiskManagerError('Disk instance already exists.');
    }

    this.instances.set(id, new DiskInstance(token));
  }

  public removeInstance(id: string) {
    if (!this.instances.has(id)) {
      throw new DiskManagerError('Disk instance not found.');
    }

    this.instances.delete(id);
  }

  public async getStatus(): Promise<DiskStatus> {
    const promises = Array.from(this.instances.values()).map(async (instance) => {
      const { totalSpace, usedSpace } = await instance.getStatus();
      return { totalSpace, usedSpace };
    });

    const instancesStatus = await Promise.all(promises);

    return instancesStatus.reduce(({ totalSpace, usedSpace }, value) => ({
      totalSpace: totalSpace + value.totalSpace,
      usedSpace: usedSpace + value.usedSpace,
    }));
  }

  public async getDirList(
    path: string,
    options: DirListOptions = { offset: 0, limit: 20, sort: SortBy.Created },
  ): Promise<Array<Resource>> {
    if (path === '/') {
      const promises = Array.from(this.instances.values()).map(async (instance) => {
        const { usedSpace: size } = await instance.getStatus();

        return {
          name: Crypto.createHash('md5').update(instance.token).digest('hex'),
          type: ResourceType.Dir,
          size,
        };
      });

      const rootDirList = await Promise.all(promises);
      return rootDirList;
    }

    const [id, ...pathParts] = path.slice(1).split('/');

    const instance = this.instances.get(id);
    if (!instance) {
      throw new DiskManagerError('Disk instance not found.');
    }

    const res = await instance.getDirList(`/${pathParts.join('/')}`, options);
    return res;
  }

  public async getFileLink(path: string): Promise<string> {
    const [id, ...pathParts] = path.slice(1).split('/');

    const instance = this.instances.get(id);
    if (!instance) {
      throw new Error('Disk instance not found.');
    }

    const url = await instance.getFileLink(`/${pathParts.join('/')}`);
    return url;
  }

  public uploadFile(stream: Stream, extension?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Array<Uint8Array> = [];

      stream.on('data', (chunk) => chunks.push(chunk));

      stream.on('end', async () => {
        const buffer = Buffer.concat(chunks);

        const promises = Array.from(this.instances.values()).map(async (instance) => {
          const { totalSpace, usedSpace } = await instance.getStatus();

          return {
            id: Crypto.createHash('md5').update(instance.token).digest('hex'),
            freeSpace: totalSpace - usedSpace,
          };
        });

        try {
          const instances = await Promise.all(promises);
          const { id, freeSpace } = instances.sort((a, b) => b.freeSpace - a.freeSpace)[0];

          if (freeSpace < buffer.length) {
            reject(new DiskManagerError('Not enough free space.'));
            return;
          }

          const hash = Crypto.createHash('sha256').update(buffer).digest('hex');
          const file = `/${hash}${extension ? `.${extension}` : ''}`;

          const uploadStream = new Duplex();

          uploadStream.push(buffer);
          uploadStream.push(null);

          const instance = this.instances.get(id);
          if (!instance) {
            throw new DiskManagerError('Disk instance not found.');
          }

          await instance.uploadFile(file, uploadStream);

          resolve(`/${id}${file}`);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  public async removeFile(path: string): Promise<boolean> {
    const [id, ...pathParts] = path.slice(1).split('/');

    const instance = this.instances.get(id);
    if (!instance) {
      throw new DiskManagerError('Disk instance not found.');
    }

    const res = await instance.removeFile(`/${pathParts.join('/')}`);
    return res;
  }
}
