import { posix as Path } from 'path';
import LeastLoadedInstanceProvider from '../services/LeastLoadedInstanceProvider';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';
import FileUploadOptions from '../../DiskInstance/interfaces/FileUploadOptions';

const uploadFile = (instanceProvider: IDiskInstanceProvider) => {
  const leastLoadedInstanceProvider = new LeastLoadedInstanceProvider(instanceProvider);

  return async (buffer: Buffer, options?: FileUploadOptions) => {
    const leastLoadedInstance = await leastLoadedInstanceProvider.get();

    if (!leastLoadedInstanceProvider.hasEnoughSpace(buffer.length)) {
      throw new Error('Not enough free space.');
    }

    const savePath = await leastLoadedInstance.uploadFile(buffer, options);

    return Path.join('/', leastLoadedInstance.id, savePath);
  };
};

export default uploadFile;
