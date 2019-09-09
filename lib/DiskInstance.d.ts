/// <reference types="node" />
import { Stream } from 'stream';
export interface DiskStatus {
    id?: string;
    totalSpace: number;
    usedSpace: number;
    maxFileSize?: number;
}
export declare enum SortBy {
    Name = "name",
    Path = "path",
    Created = "created",
    Modified = "modified",
    Size = "size"
}
export declare enum ResourceType {
    Dir = "dir",
    File = "file"
}
export interface Resource {
    type: ResourceType;
    name: string;
    created?: Date;
    modified?: Date;
    media_type?: string;
    size?: number;
}
export default class DiskInstance {
    private static readonly baseUrl;
    private token;
    constructor(token: string);
    getToken(): string;
    getStatus(): Promise<DiskStatus>;
    createDir(path: string): Promise<string>;
    getDirList(path: string, offset?: number, limit?: number, sort?: SortBy): Promise<Array<Resource>>;
    getFileLink(path: string): Promise<string>;
    uploadFile(path: string, stream: Stream): Promise<boolean>;
    removeFile(path: string): Promise<boolean>;
}
