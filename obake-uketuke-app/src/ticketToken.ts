import crypto from 'crypto';

const TOKEN_BYTES = 32;

function getEncryptionKey(): Buffer {
  const secret = process.env.TICKET_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('TICKET_TOKEN_SECRET must be at least 32 characters');
  }
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

export function generateTicketToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashTicketToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export function encryptTicketToken(token: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptTicketToken(value: string): string {
  const [ivPart, tagPart, encryptedPart] = value.split('.');
  if (!ivPart || !tagPart || !encryptedPart) {
    throw new Error('Invalid encrypted token');
  }
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivPart, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function ticketUrl(token: string): string {
  const base = (process.env.PUBLIC_FRONTEND_URL || 'https://obake-uketuke-app2-iveo.vercel.app').replace(/\/$/, '');
  return `${base}/ticket/${encodeURIComponent(token)}`;
}

export function isValidTokenFormat(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}
