import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import useHandleFetchError from '../../utils/useHandleFetchError';

export interface CreateDir {
  (path: string): Promise<boolean>;
}

const createDir = (fetchProvider: IFetchProvider, jsonParser: IJsonParser): CreateDir => {
  const handleFetchError = useHandleFetchError(jsonParser);

  return async (path: string) => {
    await handleFetchError(() =>
      fetchProvider.fetch('/resources', { method: 'PUT', queryParams: { path } }),
    );

    return true;
  };
};

export default createDir;
