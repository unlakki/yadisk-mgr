import constructGetResourceMetadata from './getResourceMetadata';
import ResourceType from '../enums/ResourceType';
import FileLink from '../interfaces/FileLink';
import BadResourceType from '../../errors/BadResourceType';
import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import useHandleFetchError from '../../utils/useHandleFetchError';

export interface GetFileLink {
  (path: string): Promise<string>;
}

const getFileLink = (fetchProvider: IFetchProvider, jsonParser: IJsonParser) => {
  const getResourceMetadata = constructGetResourceMetadata(fetchProvider, jsonParser);
  const handleHetchError = useHandleFetchError(jsonParser);

  return async (path: string) => {
    const { type } = await getResourceMetadata(path);
    if (type !== ResourceType.File) {
      throw new BadResourceType(type);
    }

    const res = await handleHetchError(() =>
      fetchProvider.fetch('/resources/download', { queryParams: { path } }),
    );

    return jsonParser.parse<FileLink>(res).href;
  };
};

export default getFileLink;
