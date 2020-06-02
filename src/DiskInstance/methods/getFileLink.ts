import { authorizedFetch } from '../utils/fetch';
import getResourceMetadata, { ResourceType } from './getResourceMetadata';

const getFileLink = (accessToken: string) => (
  async (path: string) => {
    const metadata = await getResourceMetadata(accessToken)(path);
    if (metadata.type !== ResourceType.File) {
      throw new TypeError('Invalid resource type.');
    }

    const res = await authorizedFetch<{ href: string }>('/resources/download', accessToken, {
      queryParams: {
        path,
      },
    });

    return res.href;
  }
);

export default getFileLink;
