import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import ResourceType from '../enums/ResourceType';
import DirList from '../interfaces/DirList';
import DirListOptions from '../interfaces/DirListOptions';
import Resource from '../interfaces/Resource';
import transformItems from '../utils/transformItems';
import getResourceMetadata from './getResourceMetadata';

export interface GetDirList {
  (path: string, options?: DirListOptions): Promise<Resource[]>;
}

const fields = [
  '_embedded.items.name',
  '_embedded.items.size',
  '_embedded.items.type',
  '_embedded.items.media_type',
  '_embedded.items.created',
  '_embedded.items.modified',
  '_embedded.sort',
];

const getDirList = (fetchProvider: IFetchProvider, jsonParser: IJsonParser): GetDirList => async (
  path: string,
  options?: DirListOptions,
) => {
  const resource = await getResourceMetadata(fetchProvider, jsonParser)(path);
  if (resource.type !== ResourceType.Dir) {
    throw new TypeError('Invalid resource type.');
  }

  const res = await fetchProvider.fetch('/resources', {
    queryParams: {
      path,
      ...(<any>options),
      fields,
    },
  });

  return transformItems(jsonParser.parse<DirList>(res)._embedded.items); // eslint-disable-line no-underscore-dangle
};

export default getDirList;
