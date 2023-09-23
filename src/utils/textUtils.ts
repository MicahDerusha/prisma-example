

export const lowercaseFirstLetter = (inStr: string) => {
    if (inStr === '') return inStr;
    return inStr.charAt(0).toLowerCase() + inStr.substring(1);
  };