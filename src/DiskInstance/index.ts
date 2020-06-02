import getStatus, { Status } from './methods/getStatus';
import createDir from './methods/createDir';
import getResourceMetadata, { ResourceMetadata } from './methods/getResourceMetadata';
import getDirList, { DirListOptions, Resource } from './methods/getDirList';
import getFileLink from './methods/getFileLink';
import uploadFile, { UploadFileOptions } from './methods/uploadFile';
import removeResource from './methods/removeResource';

export { Status } from './methods/getStatus';
export { ResourceType, ResourceMetadata } from './methods/getResourceMetadata';
export { SortBy, Resource, DirListOptions } from './methods/getDirList';
export { UploadFileOptions } from './methods/uploadFile';

export interface DiskInstance {
  token: string;
  getStatus: () => Promise<Status>;
  createDir: (path: string) => Promise<boolean>;
  getResourceMetadata: (path: string) => Promise<ResourceMetadata>;
  getDirList: (path: string, options?: DirListOptions) => Promise<Resource[]>;
  getFileLink: (path: string) => Promise<string>;
  uploadFile: (buffer: Buffer, options?: UploadFileOptions) => Promise<string>;
  removeResource: (path: string) => Promise<boolean>;
}

const createDiskInstance = (accessToken: string): DiskInstance => ({
  token: accessToken,
  getStatus: getStatus(accessToken),
  createDir: createDir(accessToken),
  getResourceMetadata: getResourceMetadata(accessToken),
  getDirList: getDirList(accessToken),
  getFileLink: getFileLink(accessToken),
  uploadFile: uploadFile(accessToken),
  removeResource: removeResource(accessToken),
});

export default createDiskInstance;
