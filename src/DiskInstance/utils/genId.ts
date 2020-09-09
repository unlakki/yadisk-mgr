import Crypto from 'crypto';

const ID_LENGTH = 5;

const genId = (accessToken: string) => Crypto.createHash('md5').update(accessToken).digest('hex').substr(0, ID_LENGTH);

export default genId;
