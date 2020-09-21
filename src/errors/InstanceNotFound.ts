import DiskError from './DiskError';

class InstanceNotFound extends DiskError {
  constructor(instanceId: string) {
    super(`Instance with id ${instanceId} not found`);
  }
}

export default InstanceNotFound;
