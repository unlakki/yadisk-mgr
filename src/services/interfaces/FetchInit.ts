import { RequestInit } from 'node-fetch';
import QueryParams from './QueryParams';

interface FetchInit extends RequestInit {
  queryParams?: QueryParams;
}

export default FetchInit;
