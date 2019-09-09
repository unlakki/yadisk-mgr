/// <reference types="node" />
import { Stream } from 'stream';
import { DiskStatus, SortBy, Resource } from './DiskInstance';
export default class DiskManager {
    private instances;
    constructor(tokens: Array<string>);
    addInstance(token: string): void;
    removeInstance(id: string): void;
    getStatus(): Promise<DiskStatus>;
    createDir(): void;
    getDirList(path: string, offset?: number, limit?: number, sort?: SortBy): Promise<Array<Resource>>;
    getFileLink(path: string): Promise<{
        url: string;
    }>;
    uploadFile(stream: Stream, extension: string): Promise<{
        path: string;
    }>;
    removeFile(path: string): Promise<boolean>;
}
