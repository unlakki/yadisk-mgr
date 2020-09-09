import Item from '../interfaces/Item';
import Resource from '../interfaces/Resource';

const transformItems = (items: Item[]) =>
  items.map<Resource>(({ created, modified, media_type: mediaType, ...item }) => ({
    ...item,
    createdAt: new Date(created),
    updatedAt: new Date(modified),
    mediaType,
  }));

export default transformItems;
