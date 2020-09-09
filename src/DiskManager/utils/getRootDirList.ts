import Bluebird from 'bluebird';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';
import Resource from '../../DiskInstance/interfaces/Resource';
import ResourceType from '../../DiskInstance/enums/ResourceType';

const getRootDirList = (instanceProvider: IDiskInstanceProvider) =>
  Bluebird.all<Resource>(
    Array.from(instanceProvider.items()).map(async (instance) => {
      const { usedSpace: size } = await instance.getStatus();

      return {
        name: instance.id,
        type: ResourceType.Dir,
        size,
      };
    }),
  );

export default getRootDirList;
