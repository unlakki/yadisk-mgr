import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import ResourceType from '../enums/ResourceType';
import FileLink from '../interfaces/FileLink';
import getResourceMetadata from './getResourceMetadata';

export interface GetFileLink {
  (path: string): Promise<string>;
}

const getFileLink = (fetchProvider: IFetchProvider, jsonParser: IJsonParser) => async (path: string) => {
  const metadata = await getResourceMetadata(fetchProvider, jsonParser)(path);
  if (metadata.type !== ResourceType.File) {
    throw new TypeError('Invalid resource type.');
  }

  const res = await fetchProvider.fetch('/resources/download', {
    queryParams: {
      path,
    },
  });

  return jsonParser.parse<FileLink>(res).href;
};

export default getFileLink;
