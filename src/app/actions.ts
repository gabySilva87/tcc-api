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

  try {
    // Note: This URL needs to be absolute for server-side fetch.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    if (response.ok) {
      redirect('/dashboard');
    } else {
      const errorData = await response.json();
      return {
        ...prevState,
        message: errorData.message || 'Credenciais inválidas. Verifique seu email e senha.',
        errors: {},
      };
    }
  } catch (error) {
    return {
      ...prevState,
      message: 'Ocorreu um erro de rede. Tente novamente mais tarde.',
      errors: {},
    };
  }
}

export async function logout() {
  redirect('/');
}
