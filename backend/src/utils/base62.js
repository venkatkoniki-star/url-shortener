// Base62 conversion utilities for URL short codes

export const BASE62_CHARACTERS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Converts an integer into a Base62 string
export function encodeBase62(num) {
  if (num === 0) return "0";

  let result = "";
  let n = Math.floor(num);

  while (n > 0) {
    const remainder = n % 62;
    result = BASE62_CHARACTERS[remainder] + result;
    n = Math.floor(n / 62);
  }

  return result;
}

// Converts a Base62 string back into an integer
export function decodeBase62(str) {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const index = BASE62_CHARACTERS.indexOf(str[i]);
    result = result * 62 + index;
  }
  return result;
}

// Generates a random alphanumeric code of specified length
export function generateRandomCode(length = 6) {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE62_CHARACTERS.length);
    result += BASE62_CHARACTERS[randomIndex];
  }
  return result;
}
