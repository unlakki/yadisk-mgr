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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const request_promise_1 = __importDefault(require("request-promise"));
const querystring_1 = __importDefault(require("querystring"));
const errors_1 = require("request-promise/errors");
const DiskManagerError_1 = __importDefault(require("./errors/DiskManagerError"));
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
        this._token = token;
    }
    get token() {
        return this._token;
    }
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield request_promise_1.default(DiskInstance.BASE_API_URL, {
                    method: 'GET',
                    headers: {
                        authorization: `OAuth ${this._token}`,
                    },
                });
                const { total_space: totalSpace, used_space: usedSpace, max_file_size: maxFileSize, user, } = JSON.parse(res);
                return {
                    id: user.uid, totalSpace, usedSpace, maxFileSize,
                };
            }
            catch (e) {
                if (e instanceof errors_1.StatusCodeError) {
                    switch (e.statusCode) {
                        case 401:
                            throw new DiskManagerError_1.default('Could not connect to API.');
                        default:
                            throw new DiskManagerError_1.default(JSON.parse(e.error).description);
                    }
                }
                throw new DiskManagerError_1.default('Unknown error.');
            }
        });
    }
    createDir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = querystring_1.default.stringify({ path });
            const uri = `${DiskInstance.BASE_API_URL}/resources?${query}`;
            try {
                const res = yield request_promise_1.default(uri, {
                    method: 'PUT',
                    headers: {
                        authorization: `OAuth ${this._token}`,
                    },
                });
                return JSON.parse(res).href;
            }
            catch (e) {
                if (e instanceof errors_1.StatusCodeError) {
                    switch (e.statusCode) {
                        case 401:
                            throw new DiskManagerError_1.default('Could not connect to API.');
                        case 409:
                            throw new DiskManagerError_1.default('Resource already exists.');
                        default:
                            throw new DiskManagerError_1.default(JSON.parse(e.error).description);
                    }
                }
                throw new DiskManagerError_1.default('Unknown error.');
            }
        });
    }
    getDirList(path, options = { offset: 0, limit: 20, sort: SortBy.Created }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [
                'sort',
                ...[
                    'name',
                    'size',
                    'type',
                    'media_type',
                    'created',
                    'modified',
                ].map((field) => `items.${field}`),
            ].map((field) => `_embedded.${field}`).join(',');
            const query = querystring_1.default.stringify(Object.assign(Object.assign({ path }, options), { fields }));
            const uri = `${DiskInstance.BASE_API_URL}/resources?${query}`;
            try {
                const res = yield request_promise_1.default(uri, {
                    method: 'GET',
                    headers: {
                        authorization: `OAuth ${this._token}`,
                    },
                });
                const items = (_b = (_a = JSON.parse(res)) === null || _a === void 0 ? void 0 : _a._embedded) === null || _b === void 0 ? void 0 : _b.items;
                if (!items) {
                    throw new DiskManagerError_1.default('Resource is not a directory.');
                }
                return items.map((_a) => {
                    var { created, modified, media_type: mediaType } = _a, itemData = __rest(_a, ["created", "modified", "media_type"]);
                    const item = Object.assign(Object.assign({}, itemData), { createdAt: new Date(created), updatedAt: new Date(modified) });
                    if (mediaType) {
                        item.mediaType = mediaType;
                    }
                    return item;
                });
            }
            catch (e) {
                if (e instanceof DiskManagerError_1.default) {
                    throw e;
                }
                if (e instanceof errors_1.StatusCodeError) {
                    switch (e.statusCode) {
                        case 401:
                            throw new DiskManagerError_1.default('Could not connect to API.');
                        default: {
                            throw new DiskManagerError_1.default(JSON.parse(e.error).description);
                        }
                    }
                }
                throw new DiskManagerError_1.default('Unknown error.');
            }
        });
    }
    getFileLink(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = querystring_1.default.stringify({ path });
            const uri = `${DiskInstance.BASE_API_URL}/resources/download?${query}`;
            try {
                const res = yield request_promise_1.default(uri, {
                    method: 'GET',
                    headers: {
                        authorization: `OAuth ${this._token}`,
                    },
                });
                const { href } = JSON.parse(res);
                if (!href) {
                    throw new DiskManagerError_1.default('Unable to get link for disk instance.');
                }
                return href;
            }
            catch (e) {
                if (e instanceof DiskManagerError_1.default) {
                    throw e;
                }
                if (e instanceof errors_1.StatusCodeError) {
                    switch (e.statusCode) {
                        case 401:
                            throw new DiskManagerError_1.default('Could not connect to API.');
                        default:
                            throw new DiskManagerError_1.default(JSON.parse(e.error).description);
                    }
                }
                throw new DiskManagerError_1.default('Unknown error.');
            }
        });
    }
    uploadFile(path, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = querystring_1.default.stringify({ path });
            const uri = `${DiskInstance.BASE_API_URL}/resources/upload/?${query}`;
            try {
                const res = yield request_promise_1.default(uri, {
                    method: 'GET',
                    headers: {
                        authorization: `OAuth ${this._token}`,
                    },
                });
                return new bluebird_1.default((resolve, reject) => {
                    stream.pipe(request_promise_1.default.put(JSON.parse(res).href))
                        .on('complete', () => {
                        resolve(true);
                    })
                        .on('error', () => {
                        reject(new DiskManagerError_1.default('Error while upload.'));
                    });
                });
            }
            catch (e) {
                if (e instanceof errors_1.StatusCodeError) {
                    switch (e.statusCode) {
                        case 401:
                            throw new DiskManagerError_1.default('Could not connect to API.');
                        default:
                            throw new DiskManagerError_1.default(JSON.parse(e.error).description);
                    }
                }
                throw new DiskManagerError_1.default('Unknown error.');
            }
        });
    }
    removeFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = querystring_1.default.stringify({
                path,
                permanently: true,
            });
            const uri = `${DiskInstance.BASE_API_URL}/resources?${query}`;
            try {
                yield request_promise_1.default(uri, {
                    method: 'DELETE',
                    headers: {
                        authorization: `OAuth ${this._token}`,
                    },
                });
                return true;
            }
            catch (e) {
                if (e instanceof errors_1.StatusCodeError) {
                    switch (e.statusCode) {
                        case 401:
                            throw new DiskManagerError_1.default('Could not connect to API.');
                        case 409:
                            throw new DiskManagerError_1.default('Unable to remove disk instance.');
                        default:
                            throw new DiskManagerError_1.default(JSON.parse(e.error).description);
                    }
                }
                throw new DiskManagerError_1.default('Unknown error.');
            }
        });
    }
}
exports.default = DiskInstance;
DiskInstance.BASE_API_URL = 'https://cloud-api.yandex.net/v1/disk';
