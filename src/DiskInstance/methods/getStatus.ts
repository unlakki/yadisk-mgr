import { authorizedFetch } from '../utils/fetch';

interface RawStatus {
  total_space: number;
  used_space: number;
  max_file_size: number;
  user: {
    uid: string;
  };
}

export interface Status {
  id?: string;
  totalSpace: number;
  usedSpace: number;
  maxFileSize?: number;
}

const getStatus = (accessToken: string) => (
  async (): Promise<Status> => {
    const res = await authorizedFetch<RawStatus>('/', accessToken, {
      method: 'GET',
    });

    const {
      total_space: totalSpace,
      used_space: usedSpace,
      max_file_size: maxFileSize,
      user: {
        uid: id,
      },
    } = res;

    return {
      id, totalSpace, usedSpace, maxFileSize,
    };
  }
);

export default getStatus;
