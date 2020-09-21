import DiskError from './DiskError';

class BadPathPart extends DiskError {
  constructor(path: string) {
    super(`Bad path part ${path}`);
  }
}

export default BadPathPart;
