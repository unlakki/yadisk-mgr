import { DiskInstance } from '../../DiskInstance';
import getInstance from '../utils/getInstance';

const getFileLink = (instaces: Map<string, DiskInstance>) => (
  async (path: string) => {
    const [instanceId, ...pathToFile] = path.slice(1).split('/');
    if (!pathToFile) {
      throw new Error('Invalid path.');
    }

    const instance = getInstance(instaces)(instanceId);
    const res = await instance.getFileLink(`/${pathToFile.join('/')}`);

    return res;
  }
);

export default getFileLink;
