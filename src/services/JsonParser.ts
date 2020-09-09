import IJsonParser from './interfaces/IJsonParser';

class JsonParser implements IJsonParser {
  public parse = <T>(data: string) => <T>JSON.parse(data);

  public tryParse = <T>(data: any) => {
    try {
      return this.parse<T>(data);
    } catch (e) {
      return null;
    }
  };
}

export default JsonParser;
