'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Define o schema de validação para os dados do formulário de login usando Zod.
// Isso garante que os dados enviados pelo formulário tenham o formato esperado.
const loginSchema = z.object({
  usuario: z.string().min(1, { message: 'O campo de usuário é obrigatório.'}),
  senha: z.string().min(1, { message: 'O campo de senha é obrigatório.' }),
});

// A Server Action `login` é uma função que roda exclusivamente no servidor.
// Ela recebe o estado anterior do formulário (`prevState`) e os dados do formulário (`formData`).
export async function login(prevState: any, formData: FormData) {
  // `safeParse` tenta validar os dados do formulário contra o `loginSchema`.
  // `Object.fromEntries(formData.entries())` converte os dados do formulário em um objeto JavaScript.
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  // Se a validação falhar...
  if (!validatedFields.success) {
    // Retorna um objeto de estado indicando falha, com os erros de validação
    // formatados pelo método `flatten().fieldErrors`.
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Dados inválidos.',
    };
  }

  // Extrai os dados validados de `usuario` e `senha`.
  const { usuario, senha } = validatedFields.data;

  try {
    // Constrói a URL dinamicamente para garantir que a chamada fetch funcione no servidor.
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Faz uma chamada `fetch` para a nossa API interna de login (`/api/login`).
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, senha }),
    });

    // Converte a resposta da API para JSON.
    const responseData = await response.json();

    // Se a resposta da API foi bem-sucedida (status 2xx)...
    if (response.ok) {
        // Retorna um estado de sucesso, incluindo a mensagem e o nome do motorista
        // que vieram da API. O frontend usará esses dados.
        return {
            success: true,
            message: responseData.message,
            driverName: responseData.driverName,
            errors: {},
        }
    } else {
      // Se a resposta da API indicou um erro (status 4xx ou 5xx)...
      // Retorna um estado de falha com a mensagem de erro da API.
      return {
        success: false,
        message: responseData.message || 'Credenciais inválidas. Verifique seu usuário e senha.',
        errors: {},
      };
    }
  } catch (error) {
    // Se ocorrer um erro de rede (ex: o servidor não está de pé)...
    console.error('[ERRO NA ACTION DE LOGIN]:', error);
    // Retorna uma mensagem de erro genérica.
    return {
      success: false,
      message: 'Ocorreu um erro de rede. Tente novamente mais tarde.',
      errors: {},
    };
  }
}

// Server Action para fazer o logout do usuário.
// Esta função é chamada quando o usuário clica no botão de sair.
export async function logout() {
  // `revalidatePath` invalida o cache da página do dashboard.
  // Isso não é estritamente necessário para o logout em si, mas é uma boa prática
  // para garantir que dados em cache não sejam exibidos a um usuário deslogado.
  // A principal lógica de redirecionamento está no componente do botão.
  revalidatePath('/dashboard');
}
