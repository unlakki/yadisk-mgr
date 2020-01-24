/// <reference types="node" />
import { Stream } from 'stream';
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
    name: string;
    type: ResourceType;
    mediaType?: string;
    size?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface DiskStatus {
    id?: string;
    totalSpace: number;
    usedSpace: number;
    maxFileSize?: number;
}
export interface DirListOptions {
    offset: number;
    limit: number;
    sort: SortBy;
}
export interface UploadFileOptions {
    fileName?: string;
    path?: string;
    extension?: string;
}
export default class DiskInstance {
    private static readonly BASE_API_URL;
    private _token;
    constructor(token: string);
    get token(): string;
    getStatus(): Promise<DiskStatus>;
    createDir(path: string): Promise<string>;
    getDirList(path: string, options?: DirListOptions): Promise<Resource[]>;
    getFileLink(path: string): Promise<string>;
    uploadFile(stream: Stream, options?: UploadFileOptions): Promise<string>;
    removeFile(path: string): Promise<boolean>;
}
