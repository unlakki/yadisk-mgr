import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import ResourceMetadata from '../interfaces/ResourceMetadata';

export interface GetResourceMetadata {
  (path: string): Promise<ResourceMetadata>;
}

const fields = ['type'];

const getResourceMetadata = (fetchProvider: IFetchProvider, jsonParser: IJsonParser): GetResourceMetadata => async (
  path: string,
) => {
  const res = await fetchProvider.fetch('/resources', {
    queryParams: {
      path,
      fields,
    },
  });

  return jsonParser.parse<ResourceMetadata>(res);
};

export default getResourceMetadata;
