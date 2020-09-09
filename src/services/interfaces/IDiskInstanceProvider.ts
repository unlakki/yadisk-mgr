import { DiskInstance } from '../../instance';

interface IDiskInstanceProvider {
  set: (key: string, value: DiskInstance) => IDiskInstanceProvider;
  get: (key: string) => DiskInstance;
  tryGet: (key: string) => DiskInstance | null;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  items: () => IterableIterator<DiskInstance>;
}

export default IDiskInstanceProvider;
