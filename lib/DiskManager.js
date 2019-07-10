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

  async getStatus() {
    const promises = Object.values(this.instances).map(async (instance) => {
      const { totalSpace, usedSpace } = await instance.getStatus();

      return { totalSpace, usedSpace };
    });

    const status = await Promise.all(promises);

    return status.reduce((a, v) => ({
      totalSpace: a.totalSpace + v.totalSpace,
      usedSpace: a.usedSpace + v.usedSpace,
    }));
  }

  createDirectory() {}

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
      switch (e.name) {
        case 'TypeError':
          throw new Error('Disk instance not found.');
        default:
          throw new Error(JSON.parse(e.error).description);
      }
    }
  }

  async getFileLink(path) {
    try {
      const paths = path.slice(1).split('/');

      const res = await this.instances[paths.shift()].getFileLink(paths.join('/') || '/');

      return res;
    } catch (e) {
      switch (e.name) {
        case 'TypeError':
          throw new Error('Disk instance not found.');
        default:
          throw new Error(JSON.parse(e.error).description);
      }
    }
  }

  uploadFile() {}

  async deleteFile(path) {
    try {
      const paths = path.slice(1).split('/');

      const res = await this.instances[paths.shift()].deleteFile(paths.join('/'));

      return res;
    } catch (e) {
      switch (e.name) {
        case 'TypeError':
          throw new Error('Disk instance not found.');
        default: {
          const { error, description } = JSON.parse(e.error);
          if (error === 'FieldValidationError') {
            throw new Error('Unable to remove disk instance.');
          }
          throw new Error(description);
        }
      }
    }
  }
}

module.exports = DiskManager;
