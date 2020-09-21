import Crypto from 'crypto';

class InstanceIdGenerator {
  private static ID_LENGTH = 5;

  public static generate = (accessToken: string) => {
    return Crypto.createHash('md5').update(accessToken).digest('hex').substr(0, InstanceIdGenerator.ID_LENGTH);
  };
}

export default InstanceIdGenerator;
