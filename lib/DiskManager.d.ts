/// <reference types="node" />
import { Stream } from 'stream';
import { Resource, DiskStatus, DirListOptions } from './DiskInstance';
export default class DiskManager {
    private instances;
    constructor(tokenList: Array<string>);
    addInstance(token: string): void;
    removeInstance(id: string): void;
    getStatus(): Promise<DiskStatus>;
    getDirList(path: string, options?: DirListOptions): Promise<Array<Resource>>;
    getFileLink(path: string): Promise<string>;
    uploadFile(stream: Stream, extension?: string): Promise<string>;
    removeFile(path: string): Promise<boolean>;
}
