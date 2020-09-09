const addLeadingChar = (str: string, char: string) => (str.startsWith(char) ? str : `${char}${str}`);

export default addLeadingChar;
