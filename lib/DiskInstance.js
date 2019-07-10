const Promise = require('bluebird');
const FS = require('fs');
const request = require('request-promise');

class DiskInstance {
  constructor(token) {
    this.token = token;

    this.baseUrl = 'https://cloud-api.yandex.net/v1/disk';
  }

  async getStatus() {
    const res = await request(this.baseUrl, {
      method: 'GET',
      headers: {
        authorization: `OAuth ${this.token}`,
      },
    });

    const {
      total_space, used_space, max_file_size, user: { uid },
    } = JSON.parse(res);

    return {
      uid, totalSpace: total_space, usedSpace: used_space, maxFileSize: max_file_size,
    };
  }

  async createDirectory(path) {
    const uri = `${this.baseUrl}/resources?path=${encodeURI(path)}`;

    const res = await request(uri, {
      method: 'PUT',
      headers: {
        authorization: `OAuth ${this.token}`,
      },
    })
    return JSON.parse(res).href;
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

    const res = await request(uri, {
      method: 'GET', headers: {
        authorization: `OAuth ${this.token}`,
      },
    });

    return JSON.parse(res)._embedded.items;
  }

  async getFileLink(path) {
    const uri = `${this.baseUrl}/resources/download?path=${encodeURI(path)}`;

    const res = await request(uri, {
      method: 'GET',
      headers: {
        authorization: `OAuth ${this.token}`,
      },
    });
    
    return JSON.parse(res).href;
  }

  async uploadFile(remotePath, localPath) {
    const uri = `${this.baseUrl}/resources/upload/?path=${encodeURI(remotePath)}`;

    const res = await request(uri, {
      method: 'GET',
      headers: {
        authorization: `OAuth ${this.token}`,
      },
    });

    return new Promise((resolve, reject) => {
      FS.createReadStream(localPath).pipe(request.put(JSON.parse(res).href))
      .on('complete', () => {
        resolve(true);
      })
      .on('error', () => {
        reject(new Error('Error while upload.'));
      });
    });
  }

  async uploadFileFromStream(remotePath, stream) {
    const uri = `${this.baseUrl}/resources/upload/?path=${encodeURI(remotePath)}`;

    const res = await request(uri, {
      method: 'GET',
      headers: {
        authorization: `OAuth ${this.token}`,
      },
    });

    return new Promise((resolve, reject) => {
      stream.pipe(request.put(JSON.parse(res).href))
      .on('complete', () => {
        resolve(true);
      })
      .on('error', () => {
        reject(new Error('Error while upload.'));
      });
    });
  }

  async deleteFile(path) {
    const uri = `${this.baseUrl}/resources?path=${encodeURI(path)}&permanently=true`;
  
    await request(uri, {
      method: 'DELETE',
      headers: {
        authorization: `OAuth ${this.token}`,
      },
    });

    return true;
  }
}

module.exports = DiskInstance;
