export default class DiskManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YandexDiskManagerError';
  }
}
