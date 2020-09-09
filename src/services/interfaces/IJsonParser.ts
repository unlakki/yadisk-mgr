interface IJsonParser {
  parse: <T>(data: string) => T;
  tryParse: <T>(data: string) => T | null;
}

export default IJsonParser;
