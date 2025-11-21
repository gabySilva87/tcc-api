
import { createCipheriv, createDecipheriv } from 'crypto';

// Algoritmo de criptografia.
const ALGORITHM = 'aes-256-cbc';

// Chaves carregadas do .env.local ou usa o padrão definido aqui.
// Estas chaves DEVEM ser idênticas às do backend Laravel.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV = process.env.ENCRYPTION_IV;

/**
 * Valida se as chaves de criptografia têm o tamanho correto.
 */
function validateCryptoKeys() {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('A variável de ambiente ENCRYPTION_KEY deve ter 32 caracteres.');
  }
  if (!IV || IV.length !== 16) {
    throw new Error('A variável de ambiente ENCRYPTION_IV deve ter 16 caracteres.');
  }
}

/**
 * Criptografa um texto e o retorna em base64.
 * @param text - O texto a ser criptografado.
 * @returns O texto criptografado em formato base64.
 */
export function encrypt(text: string): string {
  validateCryptoKeys();
  // Usamos 'utf-8' para as chaves, assumindo que elas são strings de texto simples.
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'utf-8'), Buffer.from(IV!, 'utf-8'));
  
  let encrypted = cipher.update(text, 'utf-8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

/**
 * Descriptografa um texto que foi criptografado.
 * @param encryptedText - O texto criptografado em base64.
 * @returns O texto original descriptografado.
 */
export function decrypt(encryptedText: string): string {
  try {
    validateCryptoKeys();
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!, 'utf-8'), Buffer.from(IV!, 'utf-8'));
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error(`[ERRO DE DESCRIPTOGRAFIA]: Falha ao descriptografar. Texto: "${encryptedText}".`, error);
    // Retorna o texto original para facilitar a depuração se a descriptografia falhar.
    return encryptedText;
  }
}
