import IFetchProvider from '../../services/interfaces/IFetchProvider';

export interface DeleteResource {
  (path: string): Promise<boolean>;
}

const deleteResource = (fetchProvider: IFetchProvider) => async (path: string) => {
  await fetchProvider.fetch('/resources', {
    method: 'DELETE',
    queryParams: {
      path,
      permanently: true.toString(),
    },
  });

  return true;
};

export default deleteResource;
