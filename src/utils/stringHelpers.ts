export function generateRandomString(
  length: number,
  includeUppercase = true,
  numbersOnly = false
): string {
  if (numbersOnly) {
    // Generate only numbers
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10); // 0-9
    }
    return result;
  }

  // For alphanumeric strings
  let chars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  if (includeUppercase) chars += uppercase;
  chars += numbers; // Always include numbers for alphanumeric generation

  let result = '';
  const charsLength = chars.length;

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }

  return result;
}
