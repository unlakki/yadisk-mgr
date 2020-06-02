import { authorizedFetch } from '../utils/fetch';
import getResourceMetadata, { ResourceType } from './getResourceMetadata';

export enum SortBy {
  Name = 'name',
  Path = 'path',
  Created = 'created',
  Modified = 'modified',
  Size = 'size',
}

interface RawResource {
  name: string;
  type: ResourceType;
  media_type?: string;
  size?: number;
  created: string;
  modified: string;
}

interface YandexDiskResponse {
  _embedded: {
    sort: string;
    items: RawResource[];
  };
}

export interface Resource {
  name: string;
  type: ResourceType;
  mediaType?: string;
  size?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DirListOptions {
  offset?: number;
  limit?: number;
  sort?: SortBy;
}

const getFields = () => [
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

const getOptions = (options: DirListOptions) => Object.entries(options).reduce(
  (acc, val) => ({ ...acc, [val[0]]: String(val[1]) }),
  {},
);

const transformItems = (items: RawResource[]): Resource[] => items.map(({
  created, modified, media_type: mediaType, ...item
}) => ({
  ...item,
  createdAt: new Date(created),
  updatedAt: new Date(modified),
  mediaType,
}));

const getDirList = (accessToken: string) => (
  async (path: string, options?: DirListOptions) => {
    const matadata = await getResourceMetadata(accessToken)(path);
    if (matadata.type !== ResourceType.Dir) {
      throw new TypeError('Invalid resource type.');
    }

    const fields = getFields();
    const opts = options && getOptions(options);

    const res = await authorizedFetch<YandexDiskResponse>('/resources', accessToken, {
      queryParams: {
        path, fields, ...opts,
      },
    });

    return transformItems(res._embedded.items); // eslint-disable-line no-underscore-dangle
  }
);

export default getDirList;
