import { posix as Path } from 'path';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';

const createDir = (instaceProvider: IDiskInstanceProvider) => async (path: string) => {
  const [id, ...pathParts] = path.slice(1).split('/');
  if (!pathParts.length) {
    throw new Error('Access denied.');
  }

  const instance = instaceProvider.get(id);
  await instance.createDir(Path.join('/', ...pathParts));

  return true;
};

export default createDir;
