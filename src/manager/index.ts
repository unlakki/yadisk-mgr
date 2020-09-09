import createDiskInstance from '../instance';
import { GetStatus } from '../instance/methods/getStatus';
import { CreateDir } from '../instance/methods/createDir';
import { GetDirList } from '../instance/methods/getDirList';
import { GetFileLink } from '../instance/methods/getFileLink';
import { UploadFile } from '../instance/methods/uploadFile';
import { DeleteResource } from '../instance/methods/deleteResource';
import genId from '../instance/utils/genId';
import DiskInstanceProvider from '../services/DiskInstanceProvider';
import getStatus from './methods/getStatus';
import createDir from './methods/createDir';
import getDirList from './methods/getDirList';
import getFileLink from './methods/getFileLink';
import uploadFile from './methods/uploadFile';
import deleteResource from './methods/deleteResource';

export interface DiskManager {
  getStatus: GetStatus;
  createDir: CreateDir;
  getDirList: GetDirList;
  getFileLink: GetFileLink;
  uploadFile: UploadFile;
  deleteResource: DeleteResource;
}

const createDiskManager = (...tokens: string[]): DiskManager => {
  const instanceProvider = new DiskInstanceProvider(tokens.map((token) => [genId(token), createDiskInstance(token)]));

  return {
    getStatus: getStatus(instanceProvider),
    createDir: createDir(instanceProvider),
    getDirList: getDirList(instanceProvider),
    getFileLink: getFileLink(instanceProvider),
    uploadFile: uploadFile(instanceProvider),
    deleteResource: deleteResource(instanceProvider),
  };
};

export default createDiskManager;
