import { DiskInstance } from '../../DiskInstance';
import getInstance from '../utils/getInstance';

const removeResource = (instances: Map<string, DiskInstance>) => (
  async (path: string) => {
    const [instanceId, ...pathToFile] = path.slice(1).split('/');
    if (!pathToFile) {
      throw new Error('Invalid path.');
    }

    const instance = getInstance(instances)(instanceId);
    await instance.removeResource(`/${pathToFile.join('/')}`);

    return true;
  }
);

export default removeResource;
