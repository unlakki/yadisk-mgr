const removeLeadingChar = (str: string, char: string) => (str.startsWith(char) ? str.slice(char.length) : str);

export default removeLeadingChar;
