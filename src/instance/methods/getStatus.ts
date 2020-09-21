import RawStatus from '../interfaces/RawStatus';
import Status from '../interfaces/Status';
import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import useHandleFetchError from '../../utils/useHandleFetchError';

export interface GetStatus {
  (): Promise<Status>;
}

const getStatus = (fetchProvider: IFetchProvider, jsonParser: IJsonParser): GetStatus => {
  const handleFetchError = useHandleFetchError(jsonParser);

  return async (): Promise<Status> => {
    const res = await handleFetchError(() => fetchProvider.fetch('/', { method: 'GET' }));

    const {
      total_space: totalSpace,
      used_space: usedSpace,
      max_file_size: maxFileSize,
      user: { uid: id },
    } = jsonParser.parse<RawStatus>(res);

    return {
      id,
      totalSpace,
      usedSpace,
      maxFileSize,
    };
  };
};

export default getStatus;
