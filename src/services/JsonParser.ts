import IJsonParser from './interfaces/IJsonParser';
import DiskError from '../errors/DiskError';

class JsonParser implements IJsonParser {
  public parse = <T>(data: string) => {
    try {
      return <T>JSON.parse(data);
    } catch (e) {
      throw new DiskError('Error while parse json');
    }
  };

  public tryParse = <T>(data: string) => {
    try {
      return this.parse<T>(data);
    } catch (e) {
      return null;
    }
  };
}

export default JsonParser;
