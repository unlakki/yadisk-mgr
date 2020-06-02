import { authorizedFetch } from '../utils/fetch';

const removeResource = (accessToken: string) => (
  async (path: string) => {
    await authorizedFetch<string>('/resources', accessToken, {
      method: 'DELETE',
      queryParams: {
        path,
        // permanently: 'true',
      },
    });

    return true;
  }
);

export default removeResource;
