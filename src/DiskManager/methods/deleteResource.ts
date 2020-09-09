import { posix as Path } from 'path';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';

const deleteResource = (instanceProvider: IDiskInstanceProvider) => async (path: string) => {
  const [id, ...pathParts] = path.slice(1).split('/');
  if (!pathParts.length) {
    throw new Error('Permission denied.');
  }

  const instance = instanceProvider.get(id);
  await instance.deleteResource(Path.join('/', ...pathParts));

  return true;
};

export default deleteResource;
