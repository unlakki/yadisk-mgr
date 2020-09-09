import { DiskInstance } from '../instance';
import IDiskInstanceProvider from './interfaces/IDiskInstanceProvider';
import InstanceNotFound from '../errors/InstanceNotFound';

class DiskInstanceProvider extends Map<string, DiskInstance> implements IDiskInstanceProvider {
  public get = (key: string) => {
    const val = super.get(key);
    if (!val) {
      throw new InstanceNotFound(key);
    }
    return val;
  };

  public tryGet = (key: string) => super.get(key) ?? null;

  public items = () => super.values();
}

export default DiskInstanceProvider;
