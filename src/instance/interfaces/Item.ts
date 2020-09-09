import ResourceType from '../enums/ResourceType';

interface Item {
  name: string;
  type: ResourceType;
  media_type?: string;
  size?: number;
  created: string;
  modified: string;
}

export default Item;
