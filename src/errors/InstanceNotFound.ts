import BaseError from './BaseError';

class InstanceNotFound extends BaseError {
  constructor(instanceId: string) {
    super(`Instance ${instanceId} not found.`);
  }
}

export default InstanceNotFound;
