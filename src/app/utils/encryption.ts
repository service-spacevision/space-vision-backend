import { ENCRYPTION_CONFIG } from '../constants/constants';

export async function encrypt(data: string): Promise<string> {
  try {
    const secret = ENCRYPTION_CONFIG.KEY;

    // key material from secret using Web Crypto API
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Create initialization vector (GCM uses 12 bytes)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt using AES-GCM
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      new TextEncoder().encode(data)
    );

    // Combine salt, IV, and encrypted data
    const combined = new Uint8Array(
      salt.length + iv.length + encrypted.byteLength
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Encode to base64 URL-safe
    return btoa(String.fromCharCode(...combined))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-256-GCM with Bun's Web Crypto API
 */
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const secret = ENCRYPTION_CONFIG.KEY;

    // Decode from base64 URL-safe
    const base64 = encryptedData.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const combined = Uint8Array.from(atob(base64 + padding), (c) =>
      c.charCodeAt(0)
    );

    // Extract salt (16 bytes), IV (12 bytes), and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    // Create key material from secret
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive the same key using the extracted salt
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt using AES-GCM
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );

    // Return decrypted text
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}
