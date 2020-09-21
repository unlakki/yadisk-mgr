import IUploadTargetProvider from './interfaces/IUploadTargetProvider';
import FileLink from '../interfaces/FileLink';
import DiskError from '../../errors/DiskError';
import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';

class UploadTargetProvider implements IUploadTargetProvider {
  private readonly _fetchProvider: IFetchProvider;

  private readonly _jsonParser: IJsonParser;

  constructor(fetchProvider: IFetchProvider, jsonParser: IJsonParser) {
    this._fetchProvider = fetchProvider;
    this._jsonParser = jsonParser;
  }

  public getUri = async (savePath: string) => {
    try {
      const res = await this._fetchProvider.fetch('/resources/upload', {
        method: 'GET',
        queryParams: {
          path: savePath,
        },
      });

      return this._jsonParser.parse<FileLink>(res).href;
    } catch (e) {
      throw new DiskError('Error while getting upload target uri');
    }
  };
}

export default UploadTargetProvider;
