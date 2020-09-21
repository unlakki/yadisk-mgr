import { expect } from 'chai';
import BadPathPart from '../src/errors/BadPathPart';
import BadResourceType from '../src/errors/BadResourceType';
import DiskError from '../src/errors/DiskError';
import InstanceIdGenerator from '../src/instance/services/InstanceIdGenerator';
import createDiskManager from '../src/manager';

const accessToken = <string>process.env.TEST_TOKEN;
const instanceId = InstanceIdGenerator.generate(accessToken);
const manager = createDiskManager(accessToken);

describe('manager', () => {
  describe('getStatus', () => {
    it('should return status object if successfully retrieved disk manager status', async () => {
      const res = await manager.getStatus();
      expect(res.totalSpace).to.be.a('number');
      expect(res.usedSpace).to.be.a('number');
    });
  });

  describe('createDir', () => {
    afterEach(async () => {
      await manager.deleteResource(`/${instanceId}/createDir.test-dir`);
    });

    it('should return true if dir sucessfully created', async () => {
      const res = await manager.createDir(`/${instanceId}/createDir.test-dir`);
      expect(res).to.eq(true);
    });

    describe('dir already exists', () => {
      before(async () => {
        await manager.createDir(`/${instanceId}/createDir.test-dir`);
      });

      it('should throw DiskError error if dir already exists', async () => {
        try {
          await manager.createDir(`/${instanceId}/createDir.test-dir`);
        } catch (e) {
          expect(e).instanceOf(DiskError);
        }
      });
    });
  });

  describe('getDirList', () => {
    it('should return array of resource if successfully retrieved', async () => {
      const res = await manager.getDirList(`/${instanceId}`);
      expect(res).to.be.an('array');
    });

    describe('file', () => {
      before(async () => {
        await manager.uploadFile(Buffer.alloc(1), { dir: '/', name: 'getDirList.test-file' });
      });

      after(async () => {
        await manager.deleteResource(`/${instanceId}/getDirList.test-file`);
      });

      it('should return BadResourceType error if trying to get dir list of file', async () => {
        try {
          await manager.getDirList(`/${instanceId}/getDirList.test-file`);
        } catch (e) {
          expect(e).instanceOf(BadResourceType);
        }
      });
    });
  });

  describe('getFileLink', () => {
    describe('dir', () => {
      it('should throw BadResourceType error if trying to get link to dir', async () => {
        try {
          await manager.getFileLink(`/${instanceId}`);
        } catch (e) {
          expect(e).instanceOf(BadPathPart);
        }
      });
    });

    describe('file', () => {
      before(async () => {
        await manager.uploadFile(Buffer.alloc(1), { dir: '/', name: 'getFileLink.test-file' });
      });

      after(async () => {
        await manager.deleteResource(`/${instanceId}/getFileLink.test-file`);
      });

      it('should return link to file if successfully retrieved', async () => {
        const res = await manager.getFileLink(`/${instanceId}/getFileLink.test-file`);
        expect(res).to.be.a('string');
      });
    });
  });

  describe('uploadFile', () => {
    describe('without options', () => {
      after(async () => {
        await manager.deleteResource(`/${instanceId}/5ba93`);
      });

      it('should return path to file if successfully uploaded file', async () => {
        const res = await manager.uploadFile(Buffer.alloc(1));
        expect(res).to.be.a('string');
      });
    });

    describe('with name option', () => {
      after(async () => {
        await manager.deleteResource(`/${instanceId}/5ba93`);
      });

      it('should return path to file if successfully uploaded file', async () => {
        const res = await manager.uploadFile(Buffer.alloc(1), { name: 'test-file' });
        expect(res)
          .to.be.a('string')
          .and.match(/\/[a-z0-9]{5}\/[a-z0-9]{5}\/test-file/);
      });
    });

    describe('with ext option', () => {
      after(async () => {
        await manager.deleteResource(`/${instanceId}/5ba93`);
      });

      it('should return path to file if successfully uploaded file', async () => {
        const res = await manager.uploadFile(Buffer.alloc(1), { ext: 'bin' });
        expect(res)
          .to.be.a('string')
          .and.match(/\/[a-z0-9]{5}\/[a-z0-9]{5}\/[a-z0-9]{40}\.bin/);
      });
    });

    describe('with dir option', () => {
      after(async () => {
        await manager.deleteResource(`/${instanceId}/uploadFile.test-dir`);
      });

      it('should return path to file with provided root path if successfully uploaded file', async () => {
        const res = await manager.uploadFile(Buffer.alloc(1), { dir: '/uploadFile.test-dir' });
        expect(res)
          .to.be.a('string')
          .and.match(/\/[a-z0-9]{5}\/uploadFile\.test-dir\/[a-z0-9]{40}/);
      });
    });
  });

  describe('deleteResource', () => {
    it('should throw DiskError if resource doesnt exists', async () => {
      try {
        await manager.deleteResource(`/${instanceId}/deleteResource.nonexistent-resource`);
      } catch (e) {
        expect(e).instanceOf(DiskError);
        expect(e.message).to.eq('Resource not found');
      }
    });

    describe('dir', () => {
      before(async () => {
        await manager.createDir(`/${instanceId}/deleteResource.test-dir`);
      });

      it('should return true if sucessfully deleted', async () => {
        const res = await manager.deleteResource(`/${instanceId}/deleteResource.test-dir`);
        expect(res).to.eq(true);
      });
    });

    describe('file', () => {
      before(async () => {
        await manager.uploadFile(Buffer.alloc(1), { dir: '/', name: 'deleteResource.test-file' });
      });

      it('should return true if sucessfully deleted', async () => {
        const res = await manager.deleteResource(`/${instanceId}/deleteResource.test-file`);
        expect(res).to.eq(true);
      });
    });
  });
});
