import createDiskInstance, { DiskInstance } from '../DiskInstance';
import genId from './utils/genId';
import getStatus from './methods/getStatus';
import createDir from './methods/createDir';
import getDirList from './methods/getDirList';
import getFileLink from './methods/getFileLink';
import uploadFile from './methods/uploadFile';
import removeResource from './methods/removeResource';

const DiskManager = (tokens: string[]) => {
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

export default DiskManager;
