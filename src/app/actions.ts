'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Define o schema de validação para os dados do formulário de login usando Zod.
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, senha }),
    });

    const responseData = await response.json();

    if (response.ok) {
        // Retorna um estado de sucesso incluindo o nome do motorista.
        return {
            success: true,
            message: responseData.message,
            driverName: responseData.driverName,
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

// Server Action para fazer o logout do usuário.
export async function logout() {
  revalidatePath('/dashboard');
}
