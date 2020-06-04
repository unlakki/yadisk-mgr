import Crypto from 'crypto';

const genId = (token: string) => (
  Crypto.createHash('sha1').update(token).digest('hex').substr(0, 16)
);

export default genId;
