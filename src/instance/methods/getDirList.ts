import constructGetResourceMetadata from './getResourceMetadata';
import ResourceType from '../enums/ResourceType';
import DirList from '../interfaces/DirList';
import DirListOptions from '../interfaces/DirListOptions';
import Resource from '../interfaces/Resource';
import BadResourceType from '../../errors/BadResourceType';
import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import transformItems from '../utils/transformItems';
import useHandleFetchError from '../../utils/useHandleFetchError';

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

const getDirList = (fetchProvider: IFetchProvider, jsonParser: IJsonParser): GetDirList => {
  const getResourceMetadata = constructGetResourceMetadata(fetchProvider, jsonParser);
  const handleFetchError = useHandleFetchError(jsonParser);

  return async (path: string, options?: DirListOptions) => {
    const { type } = await getResourceMetadata(path);
    if (type !== ResourceType.Dir) {
      throw new BadResourceType(type);
    }

    const res = await handleFetchError(() =>
      fetchProvider.fetch('/resources', { queryParams: { path, ...(<any>options), fields } }),
    );

    return transformItems(jsonParser.parse<DirList>(res)._embedded.items); // eslint-disable-line no-underscore-dangle
  };
};

export default getDirList;
