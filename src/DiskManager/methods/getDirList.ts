import Bluebird from 'bluebird';
import {
  DiskInstance, DirListOptions, ResourceType, Resource,
} from '../../DiskInstance';
import genId from '../utils/genId';
import getInstance from '../utils/getInstance';

const getRootDirList = (instances: Map<string, DiskInstance>): Bluebird<Resource[]> => (
  Bluebird.all(
    Array.from(
      instances.values(),
    ).map(
      (async (instance) => {
        const { usedSpace: size } = await instance.getStatus();

        return {
          name: genId(instance.token),
          type: ResourceType.Dir,
          size,
        };
      }),
    ),
  )
);

const getDirList = (instances: Map<string, DiskInstance>) => (
  async (path: string, options?: DirListOptions) => {
    if (path === '/') {
      const rootDirList = await getRootDirList(instances);
      return rootDirList;
    }

    const [instanceId, pathToDir = '/'] = path.slice(1).split('/');

    const instance = getInstance(instances)(instanceId);
    const result = await instance.getDirList(pathToDir, options);

    return result;
  }
);

export default getDirList;
