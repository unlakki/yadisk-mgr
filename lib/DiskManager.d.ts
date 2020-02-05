/// <reference types="node" />
import { Stream } from 'stream';
import { Resource, DiskStatus, DirListOptions, UploadFileOptions, ResourceMetadata } from './DiskInstance';
export default class DiskManager {
    private instances;
    constructor(tokenList: string[]);
    addInstance(token: string): void;
    removeInstance(id: string): void;
    getStatus(): Promise<DiskStatus>;
    getDirList(path: string, options?: DirListOptions): Promise<Resource[]>;
    getFileLink(path: string): Promise<string>;
    uploadFile(stream: Stream, options?: UploadFileOptions): Promise<string>;
    removeFile(path: string): Promise<boolean>;
    getResourceMetadata(path: string): Promise<ResourceMetadata>;
}
