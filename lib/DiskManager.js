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
const DiskManagerError_1 = __importDefault(require("./errors/DiskManagerError"));
class DiskManager {
    constructor(tokenList) {
        this.instances = new Map();
        tokenList.forEach((token) => {
            const id = crypto_1.default.createHash('md5').update(token).digest('hex');
            this.instances.set(id, new DiskInstance_1.default(token));
        });
    }
    addInstance(token) {
        const id = crypto_1.default.createHash('md5').update(token).digest('hex');
        if (this.instances.has(id)) {
            throw new DiskManagerError_1.default('Disk instance already exists.');
        }
        this.instances.set(id, new DiskInstance_1.default(token));
    }
    removeInstance(id) {
        if (!this.instances.has(id)) {
            throw new DiskManagerError_1.default('Disk instance not found.');
        }
        this.instances.delete(id);
    }
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = Array.from(this.instances.values()).map((instance) => __awaiter(this, void 0, void 0, function* () {
                const { totalSpace, usedSpace } = yield instance.getStatus();
                return { totalSpace, usedSpace };
            }));
            const instancesStatus = yield Promise.all(promises);
            return instancesStatus.reduce(({ totalSpace, usedSpace }, value) => ({
                totalSpace: totalSpace + value.totalSpace,
                usedSpace: usedSpace + value.usedSpace,
            }));
        });
    }
    getDirList(path, options = { offset: 0, limit: 20, sort: DiskInstance_1.SortBy.Created }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (path === '/') {
                const promises = Array.from(this.instances.values()).map((instance) => __awaiter(this, void 0, void 0, function* () {
                    const { usedSpace: size } = yield instance.getStatus();
                    return {
                        name: crypto_1.default.createHash('md5').update(instance.token).digest('hex'),
                        type: DiskInstance_1.ResourceType.Dir,
                        size,
                    };
                }));
                const rootDirList = yield Promise.all(promises);
                return rootDirList;
            }
            const [id, ...pathParts] = path.slice(1).split('/');
            const instance = this.instances.get(id);
            if (!instance) {
                throw new DiskManagerError_1.default('Disk instance not found.');
            }
            const res = yield instance.getDirList(`/${pathParts.join('/')}`, options);
            return res;
        });
    }
    getFileLink(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const [id, ...pathParts] = path.slice(1).split('/');
            const instance = this.instances.get(id);
            if (!instance) {
                throw new Error('Disk instance not found.');
            }
            const url = yield instance.getFileLink(`/${pathParts.join('/')}`);
            return url;
        });
    }
    uploadFile(stream, extension) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => __awaiter(this, void 0, void 0, function* () {
                const buffer = Buffer.concat(chunks);
                const promises = Array.from(this.instances.values()).map((instance) => __awaiter(this, void 0, void 0, function* () {
                    const { totalSpace, usedSpace } = yield instance.getStatus();
                    return {
                        id: crypto_1.default.createHash('md5').update(instance.token).digest('hex'),
                        freeSpace: totalSpace - usedSpace,
                    };
                }));
                try {
                    const instances = yield Promise.all(promises);
                    const { id, freeSpace } = instances.sort((a, b) => b.freeSpace - a.freeSpace)[0];
                    if (freeSpace < buffer.length) {
                        reject(new DiskManagerError_1.default('Not enough free space.'));
                        return;
                    }
                    const hash = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
                    const file = `/${hash}${extension ? `.${extension}` : ''}`;
                    const uploadStream = new stream_1.Duplex();
                    uploadStream.push(buffer);
                    uploadStream.push(null);
                    const instance = this.instances.get(id);
                    if (!instance) {
                        throw new DiskManagerError_1.default('Disk instance not found.');
                    }
                    yield instance.uploadFile(file, uploadStream);
                    resolve(`/${id}${file}`);
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    removeFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const [id, ...pathParts] = path.slice(1).split('/');
            const instance = this.instances.get(id);
            if (!instance) {
                throw new DiskManagerError_1.default('Disk instance not found.');
            }
            const res = yield instance.removeFile(`/${pathParts.join('/')}`);
            return res;
        });
    }
}
exports.default = DiskManager;
