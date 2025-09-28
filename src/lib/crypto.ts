
import { createDecipheriv } from 'crypto';

// Algoritmo de criptografia. Deve ser o mesmo usado para criptografar.
const ALGORITHM = 'aes-256-cbc';
// A chave de criptografia. DEVE ter 32 caracteres (256 bits).
// É carregada de uma variável de ambiente para segurança.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
// O Vetor de Inicialização (IV). DEVE ter 16 caracteres.
// É carregado de uma variável de ambiente.
const IV = process.env.ENCRYPTION_IV || '';

/**
 * Descriptografa um texto que foi criptografado usando o algoritmo AES-256-CBC.
 * O texto criptografado deve estar no formato 'iv:encryptedData', ambos em hexadecimal.
 * @param encryptedText - O texto criptografado a ser descriptografado.
 * @returns O texto original descriptografado.
 * @throws Lança um erro se a chave de criptografia ou o IV não estiverem configurados corretamente,
 * ou se o formato do texto criptografado for inválido.
 */
export function decrypt(encryptedText: string): string {
  // Validação para garantir que a chave e o IV estão configurados no ambiente.
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('A variável de ambiente ENCRYPTION_KEY deve ser uma string de 32 caracteres.');
  }
  if (!IV || IV.length !== 16) {
    throw new Error('A variável de ambiente ENCRYPTION_IV deve ser uma string de 16 caracteres.');
  }

  // Cria um 'decipher' usando o algoritmo, a chave e o IV.
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(IV));
  
  // Descriptografa o conteúdo. `update` processa a maior parte dos dados.
  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  
  // `final` processa qualquer dado restante (padding) e finaliza a descriptografia.
  decrypted += decipher.final('utf-8');
  
  // Retorna o texto puro e legível.
  return decrypted;
}

