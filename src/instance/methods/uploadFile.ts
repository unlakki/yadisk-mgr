import fetch from 'node-fetch';
import FileUploadOptions from '../interfaces/FileUploadOptions';
import FileHashProvider from '../services/FileHashProvider';
import FileUploadDataProvider from '../services/FileUploadDataProvider';
import TimeHashProvider from '../services/TimeHashProvider';
import UploadTargetProvider from '../services/UploadTargetProvider';
import createNestedDirectories from '../utils/createNestedDirectories';
import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import useHandleFetchError from '../../utils/useHandleFetchError';

export interface UploadFile {
  (buffer: Buffer, options?: FileUploadOptions): Promise<string>;
}

const uploadFile = (fetchProvider: IFetchProvider, jsonParser: IJsonParser): UploadFile => {
  const uploadTargetProvider = new UploadTargetProvider(fetchProvider, jsonParser);

  const handleFetchError = useHandleFetchError(jsonParser);

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

    await handleFetchError(() => fetch(uploadUri, { method: 'PUT', body: buffer }));

    return savePath;
  };
};

export default uploadFile;
