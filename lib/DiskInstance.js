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
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const request_promise_1 = __importDefault(require("request-promise"));
var SortBy;
(function (SortBy) {
    SortBy["Name"] = "name";
    SortBy["Path"] = "path";
    SortBy["Created"] = "created";
    SortBy["Modified"] = "modified";
    SortBy["Size"] = "size";
})(SortBy = exports.SortBy || (exports.SortBy = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType["Dir"] = "dir";
    ResourceType["File"] = "file";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
class DiskInstance {
    constructor(token) {
        this.token = token;
    }
    getToken() {
        return this.token;
    }
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield request_promise_1.default(DiskInstance.baseUrl, {
                    method: 'GET',
                    headers: {
                        authorization: `OAuth ${this.token}`,
                    },
                });
                const { user, total_space, used_space, max_file_size, } = JSON.parse(res);
                return {
                    id: user.uid, totalSpace: total_space, usedSpace: used_space, maxFileSize: max_file_size,
                };
            }
            catch (e) {
                if (e.message.includes('ENOTFOUND')) {
                    throw new Error('Could not connect to API.');
                }
                throw new Error(JSON.parse(e.error).description);
            }
        });
    }
    createDir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = `${DiskInstance.baseUrl}/resources?path=${encodeURI(path)}`;
            try {
                const res = yield request_promise_1.default(uri, {
                    method: 'PUT',
                    headers: {
                        authorization: `OAuth ${this.token}`,
                    },
                });
                return JSON.parse(res).href;
            }
            catch (e) {
                if (e.message.includes('ENOTFOUND')) {
                    throw new Error('Could not connect to API.');
                }
                throw new Error(JSON.parse(e.error).description);
            }
        });
    }
    getDirList(path, offset = 0, limit = 20, sort = SortBy.Created) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileds = [
                '_embedded.sort',
                '_embedded.items.name',
                '_embedded.items.size',
                '_embedded.items.type',
                '_embedded.items.media_type',
                '_embedded.items.created',
                '_embedded.items.modified',
            ].join(',');
            const uri = `${DiskInstance.baseUrl}/resources?path=${encodeURI(path)}&offset=${offset}&limit=${limit}&sort=${sort}&fields=${fileds}`;
            try {
                const res = yield request_promise_1.default(uri, {
                    method: 'GET',
                    headers: {
                        authorization: `OAuth ${this.token}`,
                    },
                });
                return JSON.parse(res)._embedded.items;
            }
            catch (e) {
                if (e.message.includes('ENOTFOUND')) {
                    throw new Error('Could not connect to API.');
                }
                switch (e.message) {
                    case 'Cannot read property \'items\' of undefined':
                        throw new Error('Resource not folder.');
                    default:
                        throw new Error(JSON.parse(e.error).description);
                }
            }
        });
    }
    getFileLink(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = `${DiskInstance.baseUrl}/resources/download?path=${encodeURI(path)}`;
            try {
                const res = yield request_promise_1.default(uri, {
                    method: 'GET',
                    headers: {
                        authorization: `OAuth ${this.token}`,
                    },
                });
                const { href } = JSON.parse(res);
                if (!href) {
                    throw new Error('Unable to get link for disk instance.');
                }
                return href;
            }
            catch (e) {
                if (e.message.includes('ENOTFOUND')) {
                    throw new Error('Could not connect to API.');
                }
                const { error } = e;
                if (error) {
                    throw new Error(JSON.parse(error).description);
                }
                throw e;
            }
        });
    }
    uploadFile(path, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = `${DiskInstance.baseUrl}/resources/upload/?path=${encodeURI(path)}`;
            try {
                const res = yield request_promise_1.default(uri, {
                    method: 'GET',
                    headers: {
                        authorization: `OAuth ${this.token}`,
                    },
                });
                return new bluebird_1.default((resolve, reject) => {
                    const { href } = JSON.parse(res);
                    stream.pipe(request_promise_1.default.put(href))
                        .on('complete', () => {
                        resolve(true);
                    })
                        .on('error', () => {
                        reject(new Error('Error while upload.'));
                    });
                });
            }
            catch (e) {
                if (e.message.includes('ENOTFOUND')) {
                    throw new Error('Could not connect to API.');
                }
                throw new Error(JSON.parse(e.error).description);
            }
        });
    }
    removeFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = `${DiskInstance.baseUrl}/resources?path=${encodeURI(path)}&permanently=true`;
            try {
                yield request_promise_1.default(uri, {
                    method: 'DELETE',
                    headers: {
                        authorization: `OAuth ${this.token}`,
                    },
                });
                return true;
            }
            catch (e) {
                if (e.message.includes('ENOTFOUND')) {
                    throw new Error('Could not connect to API.');
                }
                throw new Error(JSON.parse(e.error).description);
            }
        });
    }
}
exports.default = DiskInstance;
DiskInstance.baseUrl = 'https://cloud-api.yandex.net/v1/disk';
