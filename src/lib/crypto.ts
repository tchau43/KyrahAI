import { v4 as uuidv4 } from 'uuid';
import { sha256 } from 'js-sha256';

export function generateSecureToken(): string {
  return `${uuidv4()}${uuidv4()}`.replace(/-/g, '');
}

export function hashToken(token: string): string {
  return sha256(token);
}
