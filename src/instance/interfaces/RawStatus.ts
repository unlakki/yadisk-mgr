interface RawStatus {
  total_space: number;
  used_space: number;
  max_file_size: number;
  user: {
    uid: string;
  };
}

export default RawStatus;
