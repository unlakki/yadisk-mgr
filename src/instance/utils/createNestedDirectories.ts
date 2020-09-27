import { posix as Path } from 'path';
import Bluebird from 'bluebird';
import ResourceType from '../enums/ResourceType';
import createDir from '../methods/createDir';
import getResourceMetadata from '../methods/getResourceMetadata';
import BadPathPart from '../../errors/BadPathPart';
import DiskError from '../../errors/DiskError';
import StringExtensions from '../../extensions/StringExtensions';
import ErrorObject from '../../interfaces/ErrorObject';
import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';

const startPath = '/';

const reducer = (fetchProvider: IFetchProvider, jsonParser: IJsonParser) => async (
  createdPath: string,
  currentDir: string,
) => {
  const currentPath = Path.join(createdPath, currentDir);

  try {
    const { type } = await getResourceMetadata(fetchProvider, jsonParser)(currentPath);
    if (type !== ResourceType.Dir) {
      throw new BadPathPart(currentDir);
    }
  } catch (e) {
    if (e instanceof BadPathPart) {
      throw e;
    }

    const err = jsonParser.tryParse<ErrorObject>(e.message);
    if (err && !['DiskNotFoundError', 'DiskPathDoesntExistsError'].includes(err.error)) {
      throw new DiskError(err.description);
    }

    await createDir(fetchProvider, jsonParser)(currentPath);
  }

  return currentPath;
};

const createNestedDirectories = (
  fetchProvider: IFetchProvider,
  jsonParser: IJsonParser,
  path: string,
) =>
  Bluebird.reduce<string, string>(
    StringExtensions.removeLeadingChar(path, Path.sep).split(Path.sep),
    reducer(fetchProvider, jsonParser),
    startPath,
  );

export default createNestedDirectories;
