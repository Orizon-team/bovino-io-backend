import { createCipheriv, randomBytes, createDecipheriv, createHash } from 'crypto';

const rawKey = process.env.IMAGE_ENCRYPTION_KEY || process.env.JWT_SECRET || 'bovino_default_encryption_key_please_change';
const KEY = createHash('sha256').update(String(rawKey)).digest(); // 32 bytes

export function encryptText(plain: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  // store as iv:encrypted (hex:base64)
  return iv.toString('hex') + ':' + encrypted.toString('base64');
}

export function decryptText(enc: string): string {
  try {
    const [ivHex, data] = enc.split(':');
    if (!ivHex || !data) return enc;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', KEY, iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (e) {
    // if anything fails, return original value
    return enc;
  }
}
