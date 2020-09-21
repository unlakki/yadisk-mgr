import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import useHandleFetchError from '../../utils/useHandleFetchError';

export interface DeleteResource {
  (path: string): Promise<boolean>;
}

const deleteResource = (fetchProvider: IFetchProvider, jsonParser: IJsonParser) => {
  const handleFetchError = useHandleFetchError(jsonParser);

  return async (path: string) => {
    await handleFetchError(() =>
      fetchProvider.fetch('/resources', { method: 'DELETE', queryParams: { path, permanently: 'true' } }),
    );

    return true;
  };
};

export default deleteResource;
