
'use server';

import { createCipheriv, createDecipheriv } from 'crypto';

// Algoritmo de criptografia.
const ALGORITHM = 'aes-256-cbc';

// A chave de criptografia. DEVE ter 32 caracteres (256 bits).
// Usa a variável de ambiente ou uma chave padrão segura.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4";
// O Vetor de Inicialização (IV). DEVE ter 16 caracteres (128 bits).
// Usa a variável de ambiente ou um IV padrão seguro.
const IV = process.env.ENCRYPTION_IV || "a1b2c3d4e5f6a1b2";

/**
 * Valida as chaves de criptografia.
 * Lança um erro se as chaves tiverem o tamanho incorreto.
 */
function validateCryptoKeys() {
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('A variável de ambiente ENCRYPTION_KEY deve ser uma string de 32 caracteres.');
  }
  if (IV.length !== 16) {
    throw new Error('A variável de ambiente ENCRYPTION_IV deve ser uma string de 16 caracteres.');
  }
}

/**
 * Criptografa um texto usando o algoritmo AES-256-CBC.
 * @param text - O texto a ser criptografado.
 * @returns O texto criptografado em formato base64.
 */
export function encrypt(text: string): string {
  validateCryptoKeys();
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), Buffer.from(IV, 'utf-8'));
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

/**
 * Descriptografa um texto que foi criptografado usando o algoritmo AES-256-CBC.
 * @param encryptedText - O texto criptografado em base64.
 * @returns O texto original descriptografado.
 */
export function decrypt(encryptedText: string): string {
  try {
    validateCryptoKeys();
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), Buffer.from(IV, 'utf-8'));
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error(`[ERRO DE DESCRIPTOGRAFIA]: Falha ao descriptografar. Texto: "${encryptedText}".`, error);
    // Em caso de erro (ex: texto não criptografado), retorna o próprio texto para evitar que a aplicação quebre.
    return encryptedText;
  }
}
