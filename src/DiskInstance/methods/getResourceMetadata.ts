import { authorizedFetch } from '../utils/fetch';

export enum ResourceType {
  Dir = 'dir',
  File = 'file',
}

export interface ResourceMetadata {
  type: ResourceType;
}

const getResourceMetadata = (accessToken: string) => (
  async (path: string) => {
    const res = await authorizedFetch<ResourceMetadata>('/resources', accessToken, {
      queryParams: {
        path,
      },
    });

    return res;
  }
);

export default getResourceMetadata;
