import { posix as Path } from 'path';
import BadPathPart from '../../errors/BadPathPart';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';

const deleteResource = (instanceProvider: IDiskInstanceProvider) => async (path: string) => {
  const [id, ...pathParts] = path.slice(1).split('/');
  if (!pathParts.length) {
    throw new BadPathPart(path);
  }

  const instance = instanceProvider.get(id);
  await instance.deleteResource(Path.join('/', ...pathParts));

  return true;
};

export default deleteResource;
