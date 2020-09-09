import fetch from 'node-fetch';
import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import FileUploadOptions from '../interfaces/FileUploadOptions';
import TimeHashProvider from '../services/TimeHashProvider';
import FileHashProvider from '../services/FileHashProvider';
import FileUploadDataProvider from '../services/FileUploadDataProvider';
import UploadTargetProvider from '../services/UploadTargetProvider';
import createNestedDirectories from '../utils/createNestedDirectories';

export interface UploadFile {
  (buffer: Buffer, options?: FileUploadOptions): Promise<string>;
}

const uploadFile = (fetchProvider: IFetchProvider, jsonParser: IJsonParser): UploadFile => {
  const uploadTargetProvider = new UploadTargetProvider(fetchProvider, jsonParser);

  return async (buffer: Buffer, opts?: FileUploadOptions) => {
    const fileHashProvider = new FileHashProvider(buffer);
    const timeHashProvider = new TimeHashProvider();

    const fileUploadDataProvider = new FileUploadDataProvider(fileHashProvider, timeHashProvider);
    if (opts?.dir) {
      fileUploadDataProvider.dir = opts.dir;
    }
    if (opts?.name) {
      fileUploadDataProvider.name = opts.name;
    }
    if (opts?.ext) {
      fileUploadDataProvider.ext = opts.ext;
    }

    await createNestedDirectories(fetchProvider, jsonParser, fileUploadDataProvider.dir);

    const { savePath } = fileUploadDataProvider;

    const uploadUri = await uploadTargetProvider.getUri(savePath);
    await fetch(uploadUri, { method: 'PUT', body: buffer });

    return savePath;
  };
};

export default uploadFile;
