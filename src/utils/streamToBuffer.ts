import { Stream } from 'stream';
import Bluebird from 'bluebird';

export default (stream: Stream): Promise<Buffer> => new Bluebird((resolve, reject) => {
  const chunks: Uint8Array[] = [];

  stream.on('data', (chunk) => {
    chunks.push(chunk);
  });

  stream.on('end', () => {
    resolve(Buffer.concat(chunks));
  });

  stream.on('error', (error) => {
    reject(error);
  });
});
