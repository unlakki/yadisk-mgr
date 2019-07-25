const { Duplex } = require('stream');
const Crypto = require('crypto');
const DiskInstance = require('./DiskInstance');

class DiskManager {
  constructor(tokens) {
    this.instances = {};

    tokens.forEach((token) => {
      const id = Crypto.createHash('md5').update(token).digest('hex');
      this.instances[id] = new DiskInstance(token);
    });
  }

  addInstance() {
    throw new Error('Not implemented.');
  }

  removeInstance() {
    throw new Error('Not implemented.');
  }

  async getStatus() {
    const promises = Object.values(this.instances).map(async (instance) => {
      const { totalSpace, usedSpace } = await instance.getStatus();

      return { totalSpace, usedSpace };
    });

    const status = await Promise.all(promises);

    return status.reduce((accum, value) => ({
      totalSpace: accum.totalSpace + value.totalSpace,
      usedSpace: accum.usedSpace + value.usedSpace,
    }));
  }

  createDir() {
    throw new Error('Not implemented.');
  }

  async getDirList(path, offset = 0, limit = 20, sort = 'created') {
    if (path === '/') {
      const promises = Object.values(this.instances).map(async (instance) => {
        const { usedSpace } = await instance.getStatus();

        return {
          name: Crypto.createHash('md5').update(instance.token).digest('hex'),
          type: 'dir',
          size: usedSpace,
        };
      });

      const status = await Promise.all(promises);
      return status;
    }

    try {
      const paths = path.slice(1).split('/');

      const res = await this.instances[paths.shift()].getDirList(
        paths.join('/') || '/', offset, limit, sort,
      );

      return res;
    } catch (e) {
      switch (e.message) {
        case 'Cannot read property \'getDirList\' of undefined':
          throw new Error('Disk instance not found.');
        default:
          throw e;
      }
    }
  }

  async getFileLink(path) {
    try {
      const paths = path.slice(1).split('/');

      const url = await this.instances[paths.shift()].getFileLink(paths.join('/') || '/');

      return { url };
    } catch (e) {
      switch (e.message) {
        case 'Cannot read property \'getFileLink\' of undefined':
          throw new Error('Disk instance not found.');
        default:
          throw e;
      }
    }
  }

  uploadFile(stream, extension) {
    return new Promise((resolve, reject) => {
      const chunks = [];

      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      stream.on('end', async () => {
        const buffer = Buffer.concat(chunks);

        const promises = Object.values(this.instances).map(async (instance) => {
          const { totalSpace, usedSpace } = await instance.getStatus();

          return {
            id: Crypto.createHash('md5').update(instance.token).digest('hex'),
            freeSpace: totalSpace - usedSpace,
          };
        });

        const instances = await Promise.all(promises);
        const { id, freeSpace } = instances.sort((a, b) => b.freeSpace - a.freeSpace)[0];

        if (freeSpace < buffer.length) {
          reject(new Error('Not enough space.'));
          return;
        }

        const hash = Crypto.createHash('sha256').update(buffer).digest('hex');
        const file = `/${hash}${extension ? `.${extension}` : ''}`;

        try {
          const stream = new Duplex();

          stream.push(buffer);
          stream.push(null);

          await this.instances[id].uploadFile(file, stream);

          resolve({ path: `/${id}${file}` });
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  async removeFile(path) {
    try {
      const paths = path.slice(1).split('/');

      const res = await this.instances[paths.shift()].removeFile(paths.join('/'));

      return res;
    } catch (e) {
      if (e.message === 'Cannot read property \'removeFile\' of undefined') {
        throw new Error('Disk instance not found.');
      }

      switch (e.message) {
        case 'Error validating field "path": This field is required.':
          throw new Error('Unable to remove disk instance.');
        default: {
          throw e;
        }
      }
    }
  }
}

module.exports = DiskManager;
