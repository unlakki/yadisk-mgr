import Crypto from 'crypto';
import IFileHashProvider from './interfaces/IFileHashProvider';

class FileHashProvider implements IFileHashProvider {
  private _fileHash: string;

  constructor(file: Buffer) {
    this._fileHash = Crypto.createHash('sha1').update(file).digest('hex');
  }

  public get = () => {
    return this._fileHash;
  };
}

export default FileHashProvider;
