import baseFetch, { RequestInit as BaseRequestInit, HeaderInit, Response } from 'node-fetch';
import buildUrl from 'build-url';
import { API_ENDPOINT } from '../../config';

export interface QueryParams {
  [name: string]: string | string[];
}

export interface RequestInit extends BaseRequestInit {
  queryParams?: QueryParams;
}

const tryParseResponse = async (res: Response) => {
  const result = await res.text();
  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
};

const fetch = async <T>(path: string, init?: RequestInit) => {
  const url = buildUrl(API_ENDPOINT, { path, queryParams: init?.queryParams });

  const res = await baseFetch(url, init);
  if (res.status < 200 && res.status > 299) {
    throw new Error(res.statusText);
  }

  const contentType = res.headers.get('content-type');
  if (!contentType?.startsWith('application/json')) {
    throw new TypeError('Invalid Response Type');
  }

  const result = await tryParseResponse(res);
  if (result.error) {
    throw new Error(result.description);
  }

  return <T>result;
};

const getHeaders = (token: string) => (headers?: HeaderInit) => ({
  authorization: `OAuth ${token}`,
  ...headers,
});

export const authorizedFetch = <T>(path: string, accessToken: string, init?: RequestInit) => (
  fetch<T>(path, {
    ...init,
    headers: getHeaders(accessToken)(init?.headers),
  })
);

export default fetch;
