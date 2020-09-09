import { posix as Path } from 'path';
import IFileHashProvider from './interfaces/IFileHashProvider';
import ITimeHashProvider from './interfaces/ITimeHashProvider';
import addLeadingChar from '../../extensions/addLeadingChar';

class FileUploadDataProvider {
  private readonly _fileHashProvider: IFileHashProvider;

  private readonly _timeHashProvider: ITimeHashProvider;

  private _dir: string;

  private _name: string;

  private _ext: string;

  constructor(fileHashProvider: IFileHashProvider, timeHashProvider: ITimeHashProvider) {
    this._fileHashProvider = fileHashProvider;
    this._timeHashProvider = timeHashProvider;

    this._dir = this._fileHashProvider.get().substr(0, 5);
    this._name = this._timeHashProvider.get();
  }

  public get savePath() {
    return Path.format({ dir: Path.join('/', this._dir), name: this._name, ext: this._ext });
  }

  public get dir() {
    return this._dir;
  }

  public set dir(dir: string) {
    this._dir = dir;
    this._name = this._fileHashProvider.get();
  }

  public get name() {
    return this._name;
  }

  public set name(name: string) {
    this._name = name;
  }

  public get ext() {
    return this._ext;
  }

  public set ext(ext: string) {
    this._ext = addLeadingChar(ext, '.');
  }
}

export default FileUploadDataProvider;
