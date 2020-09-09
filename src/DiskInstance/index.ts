import FetchProvider from '../services/FetchProvider';
import JsonParser from '../services/JsonParser';
import getStatus, { GetStatus } from './methods/getStatus';
import createDir, { CreateDir } from './methods/createDir';
import getResourceMetadata, { GetResourceMetadata } from './methods/getResourceMetadata';
import getDirList, { GetDirList } from './methods/getDirList';
import getFileLink, { GetFileLink } from './methods/getFileLink';
import uploadFile, { UploadFile } from './methods/uploadFile';
import deleteResource, { DeleteResource } from './methods/deleteResource';
import genId from './utils/genId';

export interface DiskInstance {
  id: string;
  getStatus: GetStatus;
  createDir: CreateDir;
  getResourceMetadata: GetResourceMetadata;
  getDirList: GetDirList;
  getFileLink: GetFileLink;
  uploadFile: UploadFile;
  deleteResource: DeleteResource;
}

const createDiskInstance = (accessToken: string): DiskInstance => {
  const fetchProvider = new FetchProvider(accessToken);
  const jsonParser = new JsonParser();

  return {
    id: genId(accessToken),
    getStatus: getStatus(fetchProvider, jsonParser),
    createDir: createDir(fetchProvider),
    getResourceMetadata: getResourceMetadata(fetchProvider, jsonParser),
    getDirList: getDirList(fetchProvider, jsonParser),
    getFileLink: getFileLink(fetchProvider, jsonParser),
    uploadFile: uploadFile(fetchProvider, jsonParser),
    deleteResource: deleteResource(fetchProvider),
  };
};

export default createDiskInstance;
