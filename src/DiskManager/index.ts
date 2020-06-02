import createDiskInstance, {
  DiskInstance, Status, DirListOptions, Resource, UploadFileOptions,
} from '../DiskInstance';
import genId from './utils/genId';
import getStatus from './methods/getStatus';
import createDir from './methods/createDir';
import getDirList from './methods/getDirList';
import getFileLink from './methods/getFileLink';
import uploadFile from './methods/uploadFile';
import removeResource from './methods/removeResource';

export interface DiskManager {
  getStatus: () => Promise<Status>;
  createDir: (path: string) => Promise<boolean>;
  getDirList: (path: string, options?: DirListOptions) => Promise<Resource[]>;
  getFileLink: (path: string) => Promise<string>;
  uploadFile: (buffer: Buffer, options?: UploadFileOptions) => Promise<string>;
  removeResource: (path: string) => Promise<boolean>;
}

const createDiskManager = (tokens: string[]) => {
  const instances = new Map<string, DiskInstance>(
    tokens.map((token) => ([genId(token), createDiskInstance(token)])),
  );

  return ({
    getStatus: getStatus(instances),
    createDir: createDir(instances),
    getDirList: getDirList(instances),
    getFileLink: getFileLink(instances),
    uploadFile: uploadFile(instances),
    removeResource: removeResource(instances),
  });
};

export default createDiskManager;
