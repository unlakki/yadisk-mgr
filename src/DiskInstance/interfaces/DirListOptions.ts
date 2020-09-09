import SortBy from '../enums/SortBy';

interface DirListOptions {
  sort?: SortBy;
  offset?: number;
  limit?: number;
}

export default DirListOptions;
