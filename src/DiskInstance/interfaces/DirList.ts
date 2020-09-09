import EmbeddedItem from './Item';
import SortBy from '../enums/SortBy';

interface DirList {
  _embedded: {
    sort: SortBy;
    items: EmbeddedItem[];
  };
}

export default DirList;
