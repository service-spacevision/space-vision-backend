export function generateRandomString(
  length: number,
  includeUppercase = true,
  includeNumbers = true
): string {
  let chars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  if (includeUppercase) chars += uppercase;
  if (includeNumbers) chars += numbers;

  let result = '';
  const charsLength = chars.length;

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }

  return result;
}
