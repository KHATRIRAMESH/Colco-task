export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateMinLength(value, min) {
  return String(value).length >= min;
}

export function validateMaxLength(value, max) {
  return String(value).length <= max;
}

export function validateEnum(value, allowed) {
  return allowed.includes(value);
}
