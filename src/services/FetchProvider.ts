import fetch, { HeadersInit } from 'node-fetch';
import buildUrl from 'build-url';
import IFetchProvider from './interfaces/IFetchProvider';
import FetchInit from './interfaces/FetchInit';
import QueryParams from './interfaces/QueryParams';

class FetchProvider implements IFetchProvider {
  private static readonly API_ENDPOINT = 'https://cloud-api.yandex.net/v1/disk';

  private _accessToken: string;

  constructor(accessToken: string) {
    this._accessToken = accessToken;
  }

  public fetch = async (path: string, init: FetchInit) => {
    const url = this.getUrl(path, init.queryParams);
    const res = await fetch(url, {
      ...init,
      headers: this.getHeadersWithAuthorization(init.headers),
    });

    const content = await res.text();

    if (!res.ok) {
      throw new Error(content);
    }

    return content;
  };

  private getUrl = (path: string, queryParams?: QueryParams) =>
    buildUrl(FetchProvider.API_ENDPOINT, { path, queryParams });

  private getHeadersWithAuthorization = (headers?: HeadersInit) => ({
    ...headers,
    authorization: `OAuth ${this._accessToken}`,
  });
}

export default FetchProvider;
