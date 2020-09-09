import { posix as Path } from 'path';
import Bluebird from 'bluebird';
import IFetchProvider from '../../services/interfaces/IFetchProvider';
import IJsonParser from '../../services/interfaces/IJsonParser';
import ErrorObject from '../interfaces/ErrorObject';
import removeLeadingChar from '../../extensions/removeLeadingChar';
import getResourceMetadata from '../methods/getResourceMetadata';
import createDir from '../methods/createDir';
import ResourceType from '../enums/ResourceType';
import BadPathPart from '../../errors/BadPathPart';

const startPath = '/';

const createNestedDirectories = (fetchProvider: IFetchProvider, jsonParser: IJsonParser, path: string) =>
  Bluebird.reduce<string, string>(
    removeLeadingChar(path, Path.sep).split(Path.sep),
    async (pathParts, pathPart) => {
      const currentPath = Path.join(pathParts, pathPart);

      try {
        const metadata = await getResourceMetadata(fetchProvider, jsonParser)(currentPath);
        if (metadata.type !== ResourceType.Dir) {
          throw new BadPathPart('Path must only contain directories.');
        }
      } catch (e) {
        if (e instanceof BadPathPart) {
          throw e;
        }

        const err = jsonParser.parse<ErrorObject>(e.message);
        if (!['DiskNotFoundError', 'DiskPathDoesntExistsError'].includes(err.error)) {
          throw new Error(err.description);
        }

        await createDir(fetchProvider)(currentPath);
      }

      return currentPath;
    },
    startPath,
  );

export default createNestedDirectories;
