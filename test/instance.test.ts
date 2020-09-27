import { expect } from 'chai';
import BadResourceType from '../src/errors/BadResourceType';
import DiskError from '../src/errors/DiskError';
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
    afterEach(async () => {
      await instance.deleteResource('/i.createDir.test-dir');
    });

    it('should return true if dir sucessfully created', async () => {
      const res = await instance.createDir('/i.createDir.test-dir');
      expect(res).to.eq(true);
    });

    describe('dir already exists', () => {
      before(async () => {
        await instance.createDir('/i.createDir.test-dir');
      });

      it('should throw DiskError error if dir already exists', async () => {
        try {
          await instance.createDir('/i.createDir.test-dir');
        } catch (e) {
          expect(e).instanceOf(DiskError);
        }
      });
    });
  });

  describe('getResourceMetadata', async () => {
    it('should return correct type if successfully reterieved metadata for dir', async () => {
      const res = await instance.getResourceMetadata('/');
      expect(res.type).to.eq(ResourceType.Dir);
    });

    describe('file', () => {
      before(async () => {
        await instance.uploadFile(Buffer.alloc(1), {
          dir: '/',
          name: 'i.getResourceMetadata.test-file',
        });
      });

      after(async () => {
        await instance.deleteResource('/i.getResourceMetadata.test-file');
      });

      it('should return correct type if successfully reterieved metadata for file', async () => {
        const res = await instance.getResourceMetadata('/i.getResourceMetadata.test-file');
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
        await instance.uploadFile(Buffer.alloc(1), { dir: '/', name: 'i.getDirList.test-file' });
      });

      after(async () => {
        await instance.deleteResource('/i.getDirList.test-file');
      });

      it('should return BadResourceType error if trying to get dir list of file', async () => {
        try {
          await instance.getDirList('/i.getDirList.test-file');
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
          await instance.getFileLink('/');
        } catch (e) {
          expect(e).instanceOf(BadResourceType);
        }
      });
    });

    describe('file', () => {
      before(async () => {
        await instance.uploadFile(Buffer.alloc(1), { dir: '/', name: 'i.getFileLink.test-file' });
      });

      after(async () => {
        await instance.deleteResource('/i.getFileLink.test-file');
      });

      it('should return link to file if successfully retrieved', async () => {
        const res = await instance.getFileLink('/i.getFileLink.test-file');
        expect(res).to.be.a('string');
      });
    });
  });

  describe('uploadFile', () => {
    describe('without options', () => {
      after(async () => {
        await instance.deleteResource('/5ba93');
      });

      it('should return path to file if successfully uploaded file', async () => {
        const res = await instance.uploadFile(Buffer.alloc(1));
        expect(res).to.be.a('string');
      });
    });

    describe('with name option', () => {
      after(async () => {
        await instance.deleteResource('/5ba93');
      });

      it('should return path to file if successfully uploaded file', async () => {
        const res = await instance.uploadFile(Buffer.alloc(1), { name: 'i.uploadFile.test-file' });
        expect(res)
          .to.be.a('string')
          .and.match(/\/[a-z0-9]+\/i\.uploadFile\.test-file/);
      });
    });

    describe('with ext option', () => {
      after(async () => {
        await instance.deleteResource('/5ba93');
      });

      it('should return path to file if successfully uploaded file', async () => {
        const res = await instance.uploadFile(Buffer.alloc(1), { ext: 'bin' });
        expect(res)
          .to.be.a('string')
          .and.match(/\/[a-z0-9]{5}\/[a-z0-9]{40}\.bin/);
      });
    });

    describe('with dir option', () => {
      after(async () => {
        await instance.deleteResource('/i.uploadFile.test-dir');
      });

      it('should return path to file with provided root path if successfully uploaded file', async () => {
        const res = await instance.uploadFile(Buffer.alloc(1), { dir: '/i.uploadFile.test-dir' });
        expect(res)
          .to.be.a('string')
          .and.match(/\/i\.uploadFile\.test-dir\/[a-z0-9]{40}/);
      });
    });
  });

  describe('deleteResource', () => {
    it('should throw DiskError if resource doesnt exists', async () => {
      try {
        await instance.deleteResource('/i.deleteResource.nonexistent-resource');
      } catch (e) {
        expect(e).instanceOf(DiskError);
        expect(e.message).to.eq('Resource not found');
      }
    });

    describe('dir', () => {
      before(async () => {
        await instance.createDir('/i.deleteResource.test-dir');
      });

      it('should return true if sucessfully deleted', async () => {
        const res = await instance.deleteResource('/i.deleteResource.test-dir');
        expect(res).to.eq(true);
      });
    });

    describe('file', () => {
      before(async () => {
        await instance.uploadFile(Buffer.alloc(1), {
          dir: '/',
          name: 'i.deleteResource.test-file',
        });
      });

      it('should return true if sucessfully deleted', async () => {
        const res = await instance.deleteResource('/i.deleteResource.test-file');
        expect(res).to.eq(true);
      });
    });
  });
});
