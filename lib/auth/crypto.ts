/**
 * ACCOUNTS — passwords, one-time tokens and RUSH Codes. Server-only.
 *
 * Node's own crypto, no extra packages:
 *   • passwords   scrypt with a random 16-byte salt per password, stored as
 *                 "scrypt$N$r$p$salt$hash" so the cost can be raised later
 *                 without breaking existing passwords; compared in constant
 *                 time
 *   • tokens      32 random bytes, sent to the browser (session cookie) or
 *                 the member (email link) as base64url; only their SHA-256
 *                 hash is stored, so the database alone can't be used to
 *                 sign in or reset a password
 *   • RUSH Codes  "R5-" and six characters from an alphabet without the
 *                 look-alikes (0/O, 1/I/L), so they're easy to read aloud
 */

import "server-only";
import { createHash, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

const scrypt = (password: string, salt: Buffer, keylen: number, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) =>
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key))),
  );

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
// scrypt needs 128 * N * r bytes; give it headroom.
const MAXMEM = 64 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, saltB64, keyB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const key = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAXMEM,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** A hash of a throwaway password: checked against when no member matches,
    so a wrong email takes as long to answer as a wrong password. */
let decoy: Promise<string> | null = null;
export function decoyHash(): Promise<string> {
  decoy ??= hashPassword(randomBytes(12).toString("hex"));
  return decoy;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** A new random token and the hash to store for it. */
export function newToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function newRushCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `R5-${code}`;
}
