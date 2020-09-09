import ResourceType from '../enums/ResourceType';

interface Resource {
  name: string;
  type: ResourceType;
  mediaType?: string;
  size?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default Resource;
