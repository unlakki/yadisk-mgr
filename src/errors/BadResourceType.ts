import DiskError from './DiskError';

class BadResourceType extends DiskError {
  constructor(type: string) {
    super(`Type \`${type}\` invalid for this operation`);
  }
}

export default BadResourceType;
