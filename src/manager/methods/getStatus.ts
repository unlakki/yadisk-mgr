import Bluebird from 'bluebird';
import { DiskInstance } from '../../instance';
import Status from '../../instance/interfaces/Status';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';

const getStatus = (istanceProvider: IDiskInstanceProvider) => async () =>
  Bluebird.reduce<DiskInstance, Status>(
    Array.from(istanceProvider.items()),
    async ({ totalSpace, usedSpace }, instance) => {
      const status = await instance.getStatus();
      return {
        totalSpace: totalSpace + status.totalSpace,
        usedSpace: usedSpace + status.usedSpace,
      };
    },
    { totalSpace: 0, usedSpace: 0 },
  );

export default getStatus;
