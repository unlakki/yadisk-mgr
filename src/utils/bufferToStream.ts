import { Stream, Duplex } from 'stream';

export default (buffer: Buffer): Stream => {
  const duplex = new Duplex();

  duplex.push(buffer);
  duplex.push(null);

  return duplex;
};
