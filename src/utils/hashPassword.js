import crypto from "crypto";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(salt + password)
    .digest("hex");
  return { salt, hash };
}

export function verifyPassword(enteredPassword, storedHash, storedSalt) {
  const hashToVerify = crypto
    .createHash("sha256")
    .update(storedSalt + enteredPassword)
    .digest("hex");
  return hashToVerify === storedHash;
}
