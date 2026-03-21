export function converter(input, resultType) {
  if (resultType === "number") {
    const converted = Number(input);
    if (isNaN(converted)) {
      throw new Error("Input cannot be converted to a number");
    }
    return converted;
  } else if (resultType === "string") {
    return String(input);
  } else if (resultType === "date") {
    const converted = new Date(input);
    console.log(`Converted date: ${converted}`);
    if (isNaN(converted.getTime())) {
      throw new Error("Input cannot be converted to a date");
    }
    return converted;
  }
}

export function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
