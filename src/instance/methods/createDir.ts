import IFetchProvider from '../../services/interfaces/IFetchProvider';

export interface CreateDir {
  (path: string): Promise<boolean>;
}

const createDir = (fetchProvider: IFetchProvider): CreateDir => async (path: string) => {
  await fetchProvider.fetch('/resources', {
    method: 'PUT',
    queryParams: {
      path,
    },
  });

  return true;
};

export default createDir;
