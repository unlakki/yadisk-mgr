class StringExtensions {
  public static addLeadingChar = (str: string, char: string) =>
    str.startsWith(char) ? str : `${char}${str}`.toString();

  public static removeLeadingChar = (str: string, char: string) =>
    str.startsWith(char) ? str.slice(char.length) : str;

  public static removeTrailingChar = (str: string, char: string) => {
    const index = str.indexOf(char);
    if (index !== -1) {
      return str.substr(0, index);
    }

    return str;
  };
}

export default StringExtensions;
