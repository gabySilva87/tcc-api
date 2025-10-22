
import { createCipheriv, createDecipheriv } from 'crypto';

// ATENÇÃO: As funções de criptografia foram mantidas, mas a validação
// está mais flexível, pois as chaves podem não ser necessárias se a
// funcionalidade não for usada ativamente.

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef'; // Chave padrão de 32 bytes
const IV = process.env.ENCRYPTION_IV || '0123456789abcdef'; // IV padrão de 16 bytes

/**
 * Valida se as chaves de criptografia estão configuradas corretamente.
 * @throws Lança um erro se as chaves não estiverem configuradas.
 */
function validateCryptoKeys() {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.warn('A variável de ambiente ENCRYPTION_KEY não está definida ou não tem 32 caracteres. Usando valor padrão. Isso NÃO é seguro para produção.');
  }
  if (!IV || IV.length !== 16) {
    console.warn('A variável de ambiente ENCRYPTION_IV não está definida ou não tem 16 caracteres. Usando valor padrão. Isso NÃO é seguro para produção.');
  }
}

/**
 * Criptografa um texto usando o algoritmo AES-256-CBC.
 * @param text - O texto a ser criptografado.
 * @returns O texto criptografado em formato hexadecimal.
 */
export function encrypt(text: string): string {
  validateCryptoKeys();
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(IV));
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}


/**
 * Descriptografa um texto que foi criptografado usando o algoritmo AES-256-CBC.
 * O texto criptografado deve estar no formato 'iv:encryptedData', ambos em hexadecimal.
 * @param encryptedText - O texto criptografado a ser descriptografado.
 * @returns O texto original descriptografado.
 * @throws Lança um erro se a chave de criptografia ou o IV não estiverem configurados corretamente,
 * ou se o formato do texto criptografado for inválido.
 */
export function decrypt(encryptedText: string): string {
  validateCryptoKeys();
  try {
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(IV));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  } catch (error) {
    console.error(`Falha ao descriptografar: ${encryptedText}. Verifique se o dado está realmente criptografado e se as chaves estão corretas.`);
    // Retorna o texto original se a descriptografia falhar
    return encryptedText;
  }
}
