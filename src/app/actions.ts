'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// A URL base da API é construída a partir de variáveis de ambiente para portabilidade.
const baseUrl = process.env.NEXT_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;

const loginSchema = z.object({
  usuario: z.string().min(1, { message: 'O campo de usuário é obrigatório.'}),
  senha: z.string().min(1, { message: 'O campo de senha é obrigatório.' }),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Dados inválidos.',
    };
  }

  const { usuario, senha } = validatedFields.data;

  try {
    // CORREÇÃO: A URL agora é absoluta, usando a baseUrl.
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, senha }),
    });

    const responseData = await response.json();

    if (response.ok) {
        return {
            success: true,
            message: responseData.message,
            driverName: responseData.driverName,
            driverId: responseData.driverId, 
            errors: {},
        }
    } else {
      return {
        success: false,
        message: responseData.message || 'Credenciais inválidas. Verifique seu usuário e senha.',
        errors: {},
      };
    }
  } catch (error) {
    console.error('[ERRO NA ACTION DE LOGIN]:', error);
    return {
      success: false,
      message: 'Ocorreu um erro de rede. Tente novamente mais tarde.',
      errors: {},
    };
  }
}

export async function logout(driverId: string) {
  try {
    // CORREÇÃO: A URL agora é absoluta e o endpoint foi corrigido para /api/logout.
    await fetch(`${baseUrl}/api/logout`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ driverId }),
    });
  } catch (error) {
    console.error('[ERRO NA ACTION DE LOGOUT]:', error);
  }

  // Invalida o cache para garantir que os dados do dashboard sejam recarregados na próxima visita.
  revalidatePath('/dashboard');

  // A função redirect('/') foi removida. O redirecionamento agora é responsabilidade do cliente.
}
