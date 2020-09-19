import { expect } from 'chai';
import { before } from 'mocha';
import createDiskInstance from '../src/instance';
import ResourceType from '../src/instance/enums/ResourceType';

const accessToken = <string>process.env.TEST_TOKEN;
const instance = createDiskInstance(accessToken);

describe('instance', () => {
  describe('getStatus', () => {
    it('should return status object if successfully retrieved disk instance status', async () => {
      const res = await instance.getStatus();
      expect(res.id).to.be.a('string');
      expect(res.totalSpace).to.be.a('number');
      expect(res.usedSpace).to.be.a('number');
      expect(res.maxFileSize).to.be.a('number');
    });
  });

  describe('createDir', () => {
    it('should return true if directory sucessfully created', async () => {
      before(async () => {
        await instance.deleteResource('/test');
      });

      after(async () => {
        await instance.deleteResource('/test');
      });

      const res = await instance.createDir('/test');
      expect(res).to.eq(true);
    });
  });

  describe('getResourceMetadata', async () => {
    it('should return corrent type if successfully reterieved resource metadata', async () => {
      const res = await instance.getResourceMetadata('/');
      expect(res.type).to.eq(ResourceType.Dir);
    });

    describe('file metadata', () => {
      before(async () => {
        await instance.uploadFile(Buffer.alloc(1), { dir: '/', name: 'test-file' });
      });

      after(async () => {
        await instance.deleteResource('/test-file');
      });

      it('should return correct type if successfully reterieved resource metadata', async () => {
        const res = await instance.getResourceMetadata('/test-file');
        expect(res.type).to.eq(ResourceType.File);
      });
    });
  });

  describe('getDirList', () => {
    it('should return array of resource if successfully retrieved', async () => {
      const res = await instance.getDirList('/');
      expect(res).to.be.an('array');
    });

    describe('file', () => {
      before(async () => {
        await instance.uploadFile(Buffer.alloc(1), { dir: '/', name: 'test-file' });
      });

      after(async () => {
        await instance.deleteResource('/test-file');
      });

      it('should return undefined if trying to get dir list in file', async () => {
        try {
          await instance.getDirList('/test-file');
        } catch (e) {
          expect(e.message).to.eq('Invalid resource type.');
        }
      });
    });
  });

  describe('getFileLink', () => {
    before(async () => {
      await instance.uploadFile(Buffer.alloc(1), { dir: '/', name: 'test-file' });
    });

    after(async () => {
      await instance.deleteResource('/test-file');
    });

    it('should return link to file if successfully retrieved', async () => {
      const res = await instance.getFileLink('/test-file');
      expect(res).to.be.a('string');
    });
  });

  describe('uploadFile', () => {
    afterEach(async () => {
      try {
        await instance.deleteResource('/5ba93');
      } catch (e) {} // eslint-disable-line no-empty
      try {
        await instance.deleteResource('/test-dir');
      } catch (e) {} // eslint-disable-line no-empty
    });

    it('should return path to file if successfully uploaded file', async () => {
      const res = await instance.uploadFile(Buffer.alloc(1));
      expect(res).to.be.a('string');
    });

    it('should return path to file with providerd filename if successfully uploaded file', async () => {
      const res = await instance.uploadFile(Buffer.alloc(1), { name: 'test-file' });
      expect(res)
        .to.be.a('string')
        .and.match(/\/[a-z0-9]+\/test-file/);
    });

    it('should return path to file with provided file extension if successfully uploaded file', async () => {
      const res = await instance.uploadFile(Buffer.alloc(1), { ext: 'bin' });
      expect(res)
        .to.be.a('string')
        .and.match(/\/[a-z0-9]+\/[a-z0-9]+\.bin/);
    });

    it('should return path to file with provided root path if successfully uploaded file', async () => {
      const res = await instance.uploadFile(Buffer.alloc(1), { dir: '/test-dir' });
      expect(res)
        .to.be.a('string')
        .and.match(/\/test-dir\/[a-z0-9]+/);
    });
  });

  describe('deleteResource', () => {
    describe('dir', () => {
      before(async () => {
        await instance.createDir('/test-dir');
      });

      it('should return true if resource sucessfully deleted', async () => {
        const res = await instance.deleteResource('/test-dir');
        expect(res).to.eq(true);
      });
    });

    describe('file', () => {
      before(async () => {
        await instance.uploadFile(Buffer.alloc(1), { dir: '/', name: 'test-file' });
      });

      it('should return true if resource sucessfully deleted', async () => {
        const res = await instance.deleteResource('/test-file');
        expect(res).to.eq(true);
      });
    });
  });
});
