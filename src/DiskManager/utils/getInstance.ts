import { DiskInstance } from '../../DiskInstance';

const getInstance = (instances: Map<string, DiskInstance>) => (
  (instanceId: string) => {
    const instance = instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found.');
    }

    return instance;
  }
);

export default getInstance;
