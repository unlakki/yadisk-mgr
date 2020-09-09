import Bluebird from 'bluebird';
import IDiskInstanceProvider from '../../services/interfaces/IDiskInstanceProvider';
import InstanceLoadData from './interfaces/InstanceLoadData';

class LeastLoadedInstanceProvider {
  private readonly _instanceProvider: IDiskInstanceProvider;

  private _leastLoadedInstance?: InstanceLoadData;

  constructor(instanceProvider: IDiskInstanceProvider) {
    this._instanceProvider = instanceProvider;
  }

  public get = async () => {
    this._leastLoadedInstance = await this.getLeastLoadedInstance();
    return this._instanceProvider.get(this._leastLoadedInstance.id);
  };

  public hasEnoughSpace = async (needed: number) => {
    if (!this._leastLoadedInstance) {
      this._leastLoadedInstance = await this.getLeastLoadedInstance();
    }

    return this._leastLoadedInstance.freeSpace > needed;
  };

  private getLeastLoadedInstance = async () => {
    const list = await this.getInstanceLoadList();
    return list.sort((a, b) => a.freeSpace - b.freeSpace)[0];
  };

  private getInstanceLoadList = () =>
    Bluebird.all<InstanceLoadData>(
      Array.from(this._instanceProvider.items()).map(async (instance) => {
        const { totalSpace, usedSpace } = await instance.getStatus();

        return {
          id: instance.id,
          freeSpace: totalSpace - usedSpace,
        };
      }),
    );
}

export default LeastLoadedInstanceProvider;
