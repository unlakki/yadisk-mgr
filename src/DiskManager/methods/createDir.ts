import { DiskInstance } from '../../DiskInstance';
import getInstance from '../utils/getInstance';

const createDir = (instaces: Map<string, DiskInstance>) => (
  async (path: string) => {
    const [instanceId, ...pathToDir] = path.slice(1).split('/');
    if (!pathToDir) {
      throw new Error('Invalid path.');
    }

    const instance = getInstance(instaces)(instanceId);
    await instance.createDir(`/${pathToDir.join('/')}`);

    return true;
  }
);

export default createDir;
