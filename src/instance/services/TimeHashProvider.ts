import Crypto from 'crypto';
import ITimeHashProvider from './interfaces/ITimeHashProvider';

class TimeHashProvider implements ITimeHashProvider {
  private _timeHash: string;

  constructor() {
    this._timeHash = Crypto.createHash('sha1').update(Date.now().toString()).digest('hex');
  }

  public get = () => {
    return this._timeHash;
  };
}

export default TimeHashProvider;
