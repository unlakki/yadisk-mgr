import FetchInit from './FetchInit';

interface IFetchProvider {
  fetch: (path: string, init: FetchInit) => Promise<string>;
}

export default IFetchProvider;
