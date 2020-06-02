import { authorizedFetch } from '../utils/fetch';

const createDir = (accessToken: string) => (
  async (path: string) => {
    await authorizedFetch('/resources', accessToken, {
      method: 'PUT',
      queryParams: {
        path,
      },
    });

    return true;
  }
);

export default createDir;
