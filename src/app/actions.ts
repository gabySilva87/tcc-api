'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  senha: z.string().min(1, { message: 'Por favor, insira sua senha.' }),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Dados inválidos.',
    };
  }

  const { email, senha } = validatedFields.data;

  // Substitua pela URL da sua API Laravel
  const laravelApiUrl = 'https://your-laravel-api.com/api/login';

  try {
    const response = await fetch(laravelApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: email, password: senha }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Assumindo que o Laravel retorna erros de validação ou uma mensagem de erro
      return {
        ...prevState,
        message: data.message || 'Credenciais inválidas. Verifique seu email e senha.',
        errors: data.errors || {},
      };
    }

    // Se o login for bem-sucedido, o Laravel pode retornar um token,
    // que você pode salvar em um cookie seguro aqui antes de redirecionar.
    // Por enquanto, apenas redirecionamos.
    redirect('/dashboard');

  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      message: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
    };
  }
}

export async function logout() {
  // Aqui você também faria uma chamada para a API do Laravel para invalidar o token
  redirect('/');
}
