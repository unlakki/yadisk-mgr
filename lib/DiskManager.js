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

  createDirectory() {
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

      const url = await this.instances[paths.shift()].getFileLink(paths.join('/') || '/');

      return { url };
    } catch (e) {
      switch (e.name) {
        case 'TypeError':
          throw new Error('Disk instance not found.');
        default:
          throw new Error(JSON.parse(e.error).description);
      }
    }
  }

  uploadFile(stream, extension = 'bin') {
    return new Promise((resolve, reject) => {
      let data;
      stream.on('data', (chunk) => {
        data += chunk;
      });

      stream.on('end', async () => {
        const promises = Object.values(this.instances).map(async (instance) => {
          const { totalSpace, usedSpace } = await instance.getStatus();

          return {
            id: Crypto.createHash('md5').update(instance.token).digest('hex'),
            freeSpace: totalSpace - usedSpace,
          };
        });

        const space = await Promise.all(promises);
        const { id, freeSpace } = space.sort((a, b) => b.freeSpace - a.freeSpace)[0];

        if (freeSpace < data.length) {
          reject('Not enough space.');
          return;
        }

        const hash = Crypto.createHash('sha256').update(data).digest('hex');
        const file = `/${hash}.${extension}`;

        try {
          await this.instances[id].uploadFileFromStream(file, stream);

          resolve({ url: `${id}${file}` });
        } catch (e) {
          const { error, description } = JSON.parse(e.error);
          switch (error) {
            case 'DiskResourceAlreadyExistsError':
              reject(new Error('Resource already exists.'));
            default:
              reject(new Error(description));
          }
        }
      });
    });
  }

  async deleteFile(path) {
    try {
      const paths = path.slice(1).split('/');

      const res = await this.instances[paths.shift()].deleteFile(paths.join('/'));

      return res;
    } catch (e) {
      if (e.name === 'TypeError') {
        throw new Error('Disk instance not found.');
      }

      const { error, description } = JSON.parse(e.error);
      switch (error) {
        case 'FieldValidationError':
          throw new Error('Unable to remove disk instance.');
        default: {
          throw new Error(description);
        }
      }
    }
  }
}

module.exports = DiskManager;
