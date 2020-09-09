import { posix as Path } from 'path';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';

const getFileLink = (instaceProvider: IDiskInstanceProvider) => async (path: string) => {
  const [id, ...pathParts] = path.slice(1).split('/');
  if (!pathParts.length) {
    throw new Error('Access denied.');
  }

  const instance = instaceProvider.get(id);
  const fileLink = await instance.getFileLink(Path.join('/', ...pathParts));

  return fileLink;
};

export default getFileLink;
