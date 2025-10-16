import { sha256 } from 'js-sha256';
import { v4 as uuidv4 } from 'uuid';

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as unknown as { randomUUID: () => string }).randomUUID();
  }
  return uuidv4();
}

export function hashToken(token: string): string {
  return sha256(token);
}
