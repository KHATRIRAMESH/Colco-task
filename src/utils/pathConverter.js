export function pathToRegex(path) {
  const pattern = path.replace(/:(\w+)/g, "(\\d+)");
  return new RegExp(`^${pattern}$`);
}
