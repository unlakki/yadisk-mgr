import Bluebird from 'bluebird';
import { DiskInstance, UploadFileOptions } from '../../DiskInstance';
import genId from '../utils/genId';
import getInstance from '../utils/getInstance';

const getFreeSpaceList = (instances: Map<string, DiskInstance>) => (
  Bluebird.all(
    Array.from(
      instances.values(),
    ).map(
      async (instance) => {
        const { totalSpace, usedSpace } = await instance.getStatus();

        return {
          id: genId(instance.token),
          freeSpace: totalSpace - usedSpace,
        };
      },
    ),
  )
);

const uploadFile = (instances: Map<string, DiskInstance>) => (
  async (buffer: Buffer, options?: UploadFileOptions) => {
    const freeSpaceList = await getFreeSpaceList(instances);

    const { id, freeSpace } = freeSpaceList.sort(
      (a, b) => b.freeSpace - a.freeSpace,
    )[0];

    if (buffer.length > freeSpace) {
      throw new Error('Not enough free space.');
    }

    const instance = getInstance(instances)(id);
    const path = await instance.uploadFile(buffer, options);

    return `/${id}${path}`;
  }
);

export default uploadFile;
