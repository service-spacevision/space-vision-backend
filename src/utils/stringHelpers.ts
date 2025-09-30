export function generateRandomString(
  length: number,
  includeUppercase = true,
  includeNumbers = true,
  includeSpecial = true
): string {
  let chars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '@#$';

  if (includeUppercase) chars += uppercase;
  if (includeNumbers) chars += numbers;
  if (includeSpecial) chars += special;

  let result = '';
  const charsLength = chars.length;

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }

  return result;
}
