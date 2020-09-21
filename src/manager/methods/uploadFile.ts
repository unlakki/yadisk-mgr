import { posix as Path } from 'path';
import LeastLoadedInstanceProvider from '../services/LeastLoadedInstanceProvider';
import DiskError from '../../errors/DiskError';
import FileUploadOptions from '../../instance/interfaces/FileUploadOptions';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';

const uploadFile = (instanceProvider: IDiskInstanceProvider) => {
  const leastLoadedInstanceProvider = new LeastLoadedInstanceProvider(instanceProvider);

  return async (buffer: Buffer, options?: FileUploadOptions) => {
    const leastLoadedInstance = await leastLoadedInstanceProvider.get();

    const hasEnoughSpace = await leastLoadedInstanceProvider.hasEnoughSpace(buffer.length);
    if (!hasEnoughSpace) {
      throw new DiskError('Not enough free space');
    }

    const savePath = await leastLoadedInstance.uploadFile(buffer, options);

    return Path.join('/', leastLoadedInstance.id, savePath);
  };
};

export default uploadFile;
