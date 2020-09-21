import Bluebird from 'bluebird';
import Resource from '../../instance/interfaces/Resource';
import ResourceType from '../../instance/enums/ResourceType';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';

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
