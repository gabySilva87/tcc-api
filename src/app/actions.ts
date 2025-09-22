'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Define o schema de validação para os dados do formulário de login usando Zod.
// Isso garante que os dados tenham o formato esperado antes de prosseguir.
const loginSchema = z.object({
  nome: z.string().min(1, { message: 'Por favor, insira seu nome.' }),
  cpf: z.string().min(11, { message: 'Por favor, insira um CPF válido.' }),
});

// Esta é uma "Server Action" do Next.js. Ela é executada no servidor.
// `prevState` armazena o estado da ação anterior (útil para mostrar erros).
// `formData` contém os dados do formulário que o usuário enviou.
export async function login(prevState: any, formData: FormData) {
  // Valida os dados do formulário com base no `loginSchema`.
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  // Se a validação falhar, retorna os erros para serem exibidos no formulário.
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Dados inválidos.',
    };
  }

  // Se a validação for bem-sucedida, extrai os dados.
  const { nome, cpf } = validatedFields.data;

  try {
    // Monta a URL da nossa própria API de login.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    // Faz uma requisição POST para a API de login com as credenciais do usuário.
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome, cpf }),
    });

    // Se a resposta da API for bem-sucedida (status 200 OK)...
    if (response.ok) {
        // Retorna um estado de sucesso para o cliente lidar com o redirecionamento.
        return {
            success: true,
            message: 'Login bem-sucedido!',
            errors: {},
        }
    } else {
      // Se a API retornar um erro (ex: credenciais inválidas), lê a mensagem de erro...
      const errorData = await response.json();
      // ...e retorna a mensagem para ser exibida no formulário.
      return {
        success: false,
        message: errorData.message || 'Credenciais inválidas. Verifique seu nome e CPF.',
        errors: {},
      };
    }
  } catch (error) {
    // Se ocorrer um erro de rede (ex: a API não está acessível), retorna uma mensagem de erro genérica.
    console.error('[ERRO NA ACTION DE LOGIN]:', error);
    return {
      success: false,
      message: 'Ocorreu um erro de rede. Tente novamente mais tarde.',
      errors: {},
    };
  }
}

// Server Action para fazer o logout do usuário.
export async function logout() {
  // Em um app real, você invalidaria a sessão/cookie aqui.
  
  // Limpa o cache da rota do dashboard para garantir que o usuário precise logar de novo.
  revalidatePath('/dashboard');
  
  // O redirecionamento será tratado no cliente que chama esta action.
}
