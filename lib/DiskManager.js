const Crypto = require('crypto');
const DiskInstance = require('./DiskInstance');

class DiskManager {
  constructor(tokens) {
    this.instances = {};

    tokens.forEach((token) => {
      const id = Crypto.createHash('md5').update(token).digest('hex');
      this.instances[id] = new DiskInstance(token);
    });

    console.log(this.instances);
  }
}

module.exports = DiskManager;
