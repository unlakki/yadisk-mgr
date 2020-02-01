import { Stream } from 'stream';
import Crypto from 'crypto';
import Bluebird from 'bluebird';
import streamToBuffer from './utils/streamToBuffer';
import bufferToStream from './utils/bufferToStream';
import DiskInstance, {
  SortBy,
  ResourceType,
  Resource,
  DiskStatus,
  DirListOptions,
  UploadFileOptions,
} from './DiskInstance';
import DiskManagerError from './errors/DiskManagerError';

export default class DiskManager {
  private instances = new Map<string, DiskInstance>();

  constructor(tokenList: string[]) {
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

    const instances = await Bluebird.all(promises);

    return instances.reduce(({ totalSpace, usedSpace }, instance) => ({
      totalSpace: totalSpace + instance.totalSpace,
      usedSpace: usedSpace + instance.usedSpace,
    }));
  }

  public async getDirList(
    path: string,
    options: DirListOptions = { offset: 0, limit: 20, sort: SortBy.Created },
  ): Promise<Resource[]> {
    if (path === '/') {
      const promises = Array.from(this.instances.values()).map(async (instance) => {
        const { usedSpace: size } = await instance.getStatus();

        return {
          name: Crypto.createHash('md5').update(instance.token).digest('hex'),
          type: ResourceType.Dir,
          size,
        };
      });

      const rootDirList = await Bluebird.all(promises);
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

  public async uploadFile(stream: Stream, options?: UploadFileOptions): Promise<string> {
    const freeSpaceRequestList = Array.from(this.instances.values()).map(async (instance) => {
      const { totalSpace, usedSpace } = await instance.getStatus();

      return {
        id: Crypto.createHash('md5').update(instance.token).digest('hex'),
        freeSpace: totalSpace - usedSpace,
      };
    });

    const freeSpaceList = await Bluebird.all(freeSpaceRequestList);
    const { id, freeSpace } = freeSpaceList.sort((a, b) => b.freeSpace - a.freeSpace)[0];

    const buffer = await streamToBuffer(stream);

    if (freeSpace < buffer.length) {
      throw new DiskManagerError('Not enough free space.');
    }

    const instance = this.instances.get(id);
    if (!instance) {
      throw new DiskManagerError('Disk instance not found.');
    }

    const path = await instance.uploadFile(bufferToStream(buffer), options);
    return path;
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
