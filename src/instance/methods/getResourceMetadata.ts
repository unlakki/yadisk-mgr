import ResourceMetadata from '../interfaces/ResourceMetadata';
import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import useHandleFetchError from '../../utils/useHandleFetchError';

export interface GetResourceMetadata {
  (path: string): Promise<ResourceMetadata>;
}

const fields = ['type'];

const getResourceMetadata = (fetchProvider: IFetchProvider, jsonParser: IJsonParser): GetResourceMetadata => {
  const handleFetchError = useHandleFetchError(jsonParser);

  return async (path: string) => {
    const res = await handleFetchError(() => fetchProvider.fetch('/resources', { queryParams: { path, fields } }));

    return jsonParser.parse<ResourceMetadata>(res);
  };
};

export default getResourceMetadata;
