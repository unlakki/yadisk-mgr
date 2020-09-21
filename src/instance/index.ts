import FetchProvider from '../services/FetchProvider';
import JsonParser from '../services/JsonParser';
import createDir, { CreateDir } from './methods/createDir';
import deleteResource, { DeleteResource } from './methods/deleteResource';
import getDirList, { GetDirList } from './methods/getDirList';
import getFileLink, { GetFileLink } from './methods/getFileLink';
import getResourceMetadata, { GetResourceMetadata } from './methods/getResourceMetadata';
import getStatus, { GetStatus } from './methods/getStatus';
import uploadFile, { UploadFile } from './methods/uploadFile';
import InstanceIdGenerator from './services/InstanceIdGenerator';

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
    id: InstanceIdGenerator.generate(accessToken),
    getStatus: getStatus(fetchProvider, jsonParser),
    createDir: createDir(fetchProvider, jsonParser),
    getResourceMetadata: getResourceMetadata(fetchProvider, jsonParser),
    getDirList: getDirList(fetchProvider, jsonParser),
    getFileLink: getFileLink(fetchProvider, jsonParser),
    uploadFile: uploadFile(fetchProvider, jsonParser),
    deleteResource: deleteResource(fetchProvider, jsonParser),
  };
};

export default createDiskInstance;
