'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  cpf: z.string().min(11, { message: 'Por favor, insira um CPF válido.' }),
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

  const { email, cpf } = validatedFields.data;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, cpf }),
    });

    if (response.ok) {
      // For a real app, you would set a session cookie here.
      // For this example, we'll just redirect.
      redirect('/dashboard');
    } else {
      const errorData = await response.json();
      return {
        ...prevState,
        message: errorData.message || 'Credenciais inválidas. Verifique seu email e CPF.',
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
  // In a real app with session management, you would clear the session here.
  redirect('/');
}
