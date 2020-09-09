import { posix as Path } from 'path';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';
import DirListOptions from '../../instance/interfaces/DirListOptions';
import getRootDirList from '../utils/getRootDirList';

const getDirList = (instanceProvider: IDiskInstanceProvider) => async (path: string, options?: DirListOptions) => {
  if (path === '/') {
    const rootDirList = await getRootDirList(instanceProvider);
    return rootDirList;
  }

  const [id, ...pathParts] = path.slice(1).split('/');

  const instance = instanceProvider.get(id);
  const dirList = await instance.getDirList(Path.join('/', ...pathParts), options);

  return dirList;
};

export default getDirList;
