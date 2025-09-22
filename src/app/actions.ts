'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  nome: z.string().min(1, { message: 'Por favor, insira seu nome.' }),
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

  const { nome, senha } = validatedFields.data;

  // Lógica de autenticação de teste
  if (nome === 'driver' && senha === 'password') {
    redirect('/dashboard');
  } else {
    return {
      ...prevState,
      message: 'Credenciais inválidas. Verifique seu nome e senha.',
      errors: {},
    };
  }
}

export async function logout() {
  redirect('/');
}
