const Promise = require('bluebird');
const request = require('request-promise');

class DiskInstance {
  constructor(token) {
    this.token = token;

    this.baseUrl = 'https://cloud-api.yandex.net/v1/disk';
  }

  async getStatus() {
    try {
      const res = await request(this.baseUrl, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      const {
        user, total_space, used_space, max_file_size,
      } = JSON.parse(res);

      return {
        id: user.uid,
        totalSpace: total_space,
        usedSpace: used_space,
        maxFileSize: max_file_size,
      };
    } catch (e) {
      throw new Error(JSON.parse(e.error).description);
    }
  }

  async createDir(path) {
    const uri = `${this.baseUrl}/resources?path=${encodeURI(path)}`;

    try {
      const res = await request(uri, {
        method: 'PUT',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      })

      return JSON.parse(res).href;
    } catch (e) {
      throw new Error(JSON.parse(e.error).description);
    }
  }

  async getDirList(path, offset = 0, limit = 20, sort = 'created') {
    const fileds = [
      '_embedded.sort',
      '_embedded.items.name',
      '_embedded.items.size',
      '_embedded.items.type',
      '_embedded.items.media_type',
      '_embedded.items.created',
      '_embedded.items.modified',
    ].join(',');

    const uri = `${this.baseUrl}/resources?path=${encodeURI(path)}&offset=${offset}&limit=${limit}&sort=${sort}&fields=${fileds}`;

    try {
      const res = await request(uri, {
        method: 'GET', headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      return JSON.parse(res)._embedded.items;

    } catch (e) {
      switch(e.message) {
        case 'Cannot read property \'items\' of undefined':
          throw new Error('Resource not folder.');
        default:
          throw new Error(JSON.parse(e.error).description);
      }
    }
  }

  async getFileLink(path) {
    const uri = `${this.baseUrl}/resources/download?path=${encodeURI(path)}`;

    try {
      const res = await request(uri, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      return JSON.parse(res).href;
    } catch (e) {
      throw new Error(JSON.parse(e.error).description);
    }
  }

  async uploadFile(path, stream) {
    const uri = `${this.baseUrl}/resources/upload/?path=${encodeURI(path)}`;

   try {
    const res = await request(uri, {
      method: 'GET',
      headers: {
        authorization: `OAuth ${this.token}`,
      },
    });

    return new Promise((resolve, reject) => {
      const { href } = JSON.parse(res);

      stream.pipe(request.put(href))
        .on('complete', () => {
          resolve(true);
        })
        .on('error', () => {
          reject(new Error('Error while upload.'));
        });
    });
   } catch (e) {
     throw new Error(JSON.parse(e.error).description);
   }
  }

  async removeFile(path) {
    const uri = `${this.baseUrl}/resources?path=${encodeURI(path)}&permanently=true`;

    try {
      await request(uri, {
        method: 'DELETE',
        headers: {
          authorization: `OAuth ${this.token}`,
        },
      });

      return true;
    } catch (e) {
      throw new Error(JSON.parse(e.error).description);
    }
  }
}

module.exports = DiskInstance;
