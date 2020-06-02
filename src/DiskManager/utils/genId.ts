import Crypto from 'crypto';

const genId = (token: string) => (
  Crypto.createHash('sha512').update(token).digest('hex').substr(0, 8)
);

export default genId;
