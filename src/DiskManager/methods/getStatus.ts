import Bluebird from 'bluebird';
import { DiskInstance, Status } from '../../DiskInstance';

const getStatus = (instances: Map<string, DiskInstance>) => (
  async () => {
    const promises = await Bluebird.all(
      Array.from(
        instances.values(),
      ).map(
        (instance) => instance.getStatus(),
      ),
    );

    return promises.reduce<Status>((acc, status) => ({
      totalSpace: acc.totalSpace + status.totalSpace,
      usedSpace: acc.usedSpace + status.usedSpace,
    }), { totalSpace: 0, usedSpace: 0 });
  }
);

export default getStatus;
