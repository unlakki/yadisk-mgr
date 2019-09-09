"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const crypto_1 = __importDefault(require("crypto"));
const DiskInstance_1 = __importStar(require("./DiskInstance"));
class DiskManager {
    constructor(tokens) {
        this.instances = new Map();
        tokens.forEach((token) => {
            const id = crypto_1.default.createHash('md5').update(token).digest('hex');
            this.instances.set(id, new DiskInstance_1.default(token));
        });
    }
    addInstance(token) {
        const id = crypto_1.default.createHash('md5').update(token).digest('hex');
        if (id in this.instances) {
            throw new Error('Disk instance already exists.');
        }
        this.instances.set(id, new DiskInstance_1.default(token));
    }
    removeInstance(id) {
        if (!this.instances.has(id)) {
            throw new Error('Disk instance not found.');
        }
        this.instances.delete(id);
    }
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = Array.from(this.instances.values()).map((instance) => __awaiter(this, void 0, void 0, function* () {
                const { totalSpace, usedSpace } = yield instance.getStatus();
                return { totalSpace, usedSpace };
            }));
            const status = yield Promise.all(promises);
            return status.reduce(({ totalSpace, usedSpace }, value) => ({
                totalSpace: totalSpace + value.totalSpace,
                usedSpace: usedSpace + value.usedSpace,
            }));
        });
    }
    createDir() {
        throw new Error('Not implemented.');
    }
    getDirList(path, offset = 0, limit = 20, sort = DiskInstance_1.SortBy.Created) {
        return __awaiter(this, void 0, void 0, function* () {
            if (path === '/') {
                const promises = Array.from(this.instances.values()).map((instance) => __awaiter(this, void 0, void 0, function* () {
                    const { usedSpace } = yield instance.getStatus();
                    return {
                        name: crypto_1.default.createHash('md5').update(instance.getToken()).digest('hex'),
                        type: 'dir',
                        size: usedSpace,
                    };
                }));
                const status = yield Promise.all(promises);
                return status;
            }
            try {
                const paths = path.slice(1).split('/');
                const id = paths.shift();
                if (!id) {
                    throw new Error('Incorrect path.');
                }
                const instance = this.instances.get(id);
                if (!instance) {
                    throw new Error('Disk instance not found.');
                }
                const res = yield instance.getDirList(paths.join('/') || '/', offset, limit, sort);
                return res;
            }
            catch (e) {
                throw e;
            }
        });
    }
    getFileLink(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paths = path.slice(1).split('/');
                const id = paths.shift();
                if (!id) {
                    throw new Error('Incorrect path.');
                }
                const instance = this.instances.get(id);
                if (!instance) {
                    throw new Error('Disk instance not found.');
                }
                const url = yield instance.getFileLink(paths.join('/') || '/');
                return { url };
            }
            catch (e) {
                throw e;
            }
        });
    }
    uploadFile(stream, extension) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            stream.on('end', () => __awaiter(this, void 0, void 0, function* () {
                const buffer = Buffer.concat(chunks);
                const promises = Array.from(this.instances.values()).map((instance) => __awaiter(this, void 0, void 0, function* () {
                    const { totalSpace, usedSpace } = yield instance.getStatus();
                    return {
                        id: crypto_1.default.createHash('md5').update(instance.getToken()).digest('hex'),
                        freeSpace: totalSpace - usedSpace,
                    };
                }));
                const instances = yield Promise.all(promises);
                const { id, freeSpace } = instances.sort((a, b) => b.freeSpace - a.freeSpace)[0];
                if (freeSpace < buffer.length) {
                    reject(new Error('Not enough space.'));
                    return;
                }
                const hash = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
                const file = `/${hash}${extension ? `.${extension}` : ''}`;
                try {
                    const stream = new stream_1.Duplex();
                    stream.push(buffer);
                    stream.push(null);
                    const instance = this.instances.get(id);
                    if (!instance) {
                        throw new Error('Disk instance not found.');
                    }
                    yield instance.uploadFile(file, stream);
                    resolve({ path: `/${id}${file}` });
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    removeFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paths = path.slice(1).split('/');
                const instance = this.instances.get(paths.shift());
                if (!instance) {
                    throw new Error('Incorrect path.');
                }
                const res = yield instance.removeFile(paths.join('/'));
                return res;
            }
            catch (e) {
                switch (e.message) {
                    case 'Error validating field "path": This field is required.':
                        throw new Error('Unable to remove disk instance.');
                    case 'Cannot read property \'removeFile\' of undefined':
                        throw new Error('Disk instance not found.');
                    default: {
                        throw e;
                    }
                }
            }
        });
    }
}
exports.default = DiskManager;
