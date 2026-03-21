import crypto from "crypto";

export function hashPassword(password) {
  const salt = crypto.randomBytes(8).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(salt + password)
    .digest("hex");
  const hashedPassword = `${salt}:${hash}`;
  return { hashedPassword };
}

export function verifyPassword(enteredPassword, storedHash) {
  const [salt, hashedPassword] = storedHash.split(":");
  const hashToVerify = crypto
    .createHash("sha256")
    .update(salt + enteredPassword)
    .digest("hex");
  return hashToVerify === hashedPassword;
}
