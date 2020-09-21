import DiskError from '../errors/DiskError';
import StringExtensions from '../extensions/StringExtensions';
import ErrorObject from '../interfaces/ErrorObject';
import IJsonParser from '../services/interfaces/IJsonParser';

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T extends () => PromiseLike<infer V> ? V : T;

const useHandleFetchError = (jsonParser: IJsonParser) => async <T extends () => any>(func: T): Promise<ThenArg<T>> => {
  try {
    return await func();
  } catch (e) {
    const err = jsonParser.tryParse<ErrorObject>(e.message);
    if (err) {
      throw new DiskError(StringExtensions.removeTrailingChar(err.description, '.'));
    }

    throw e;
  }
};

export default useHandleFetchError;
