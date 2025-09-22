'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  cpf: z.string().min(1, { message: 'Por favor, insira seu CPF.' }),
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

  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  if (email === 'driver@example.com' && cpf === '123.456.789-00') {
    redirect('/dashboard');
  } else {
    return {
      ...prevState,
      message: 'Credenciais inválidas. Verifique seu email e CPF.',
    };
  }
}

export async function logout() {
  redirect('/');
}
