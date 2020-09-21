import createDir from './methods/createDir';
import deleteResource from './methods/deleteResource';
import getDirList from './methods/getDirList';
import getFileLink from './methods/getFileLink';
import getStatus from './methods/getStatus';
import uploadFile from './methods/uploadFile';
import createDiskInstance from '../instance';
import { CreateDir } from '../instance/methods/createDir';
import { DeleteResource } from '../instance/methods/deleteResource';
import { GetDirList } from '../instance/methods/getDirList';
import { GetFileLink } from '../instance/methods/getFileLink';
import { GetStatus } from '../instance/methods/getStatus';
import { UploadFile } from '../instance/methods/uploadFile';
import InstanceIdGenerator from '../instance/services/InstanceIdGenerator';
import DiskInstanceProvider from '../services/DiskInstanceProvider';

export interface DiskManager {
  getStatus: GetStatus;
  createDir: CreateDir;
  getDirList: GetDirList;
  getFileLink: GetFileLink;
  uploadFile: UploadFile;
  deleteResource: DeleteResource;
}

const createDiskManager = (...tokens: string[]): DiskManager => {
  const instanceProvider = new DiskInstanceProvider(
    tokens.map((token) => [InstanceIdGenerator.generate(token), createDiskInstance(token)]),
  );

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
