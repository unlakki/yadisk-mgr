"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DiskManagerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'YandexDiskManagerError';
    }
}
exports.default = DiskManagerError;
