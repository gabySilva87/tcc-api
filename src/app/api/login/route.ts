import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nome, senha } = await request.json();

    // Lógica de autenticação de teste
    if (nome === 'driver' && senha === 'password') {
      return NextResponse.json({ success: true, message: 'Login bem-sucedido!' });
    } else {
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas. Verifique seu nome e senha.' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ocorreu um erro no servidor.' },
      { status: 500 }
    );
  }
}
