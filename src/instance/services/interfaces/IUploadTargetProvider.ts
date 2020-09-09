interface IUploadTargetProvider {
  getUri: (savePath: string) => Promise<string>;
}

export default IUploadTargetProvider;
