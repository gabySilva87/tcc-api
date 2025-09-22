import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: Request) {
  const { email, cpf } = await request.json();

  if (!email || !cpf) {
    return NextResponse.json(
      { success: false, message: 'Email e CPF são obrigatórios.' },
      { status: 400 }
    );
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    // NOTE: Storing emails in the driver table is necessary for this to work.
    // The current schema only has nm_motorista, nr_cpf, nr_telefone.
    // Assuming an 'email' column exists for this query.
    const [rows] = await connection.execute(
      'SELECT * FROM tb_motorista WHERE email = ? AND nr_cpf = ?',
      [email, cpf]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      // In a real application, you should generate a JWT or a session token here
      // and return it to the client to manage the session.
      return NextResponse.json({ success: true, message: 'Login bem-sucedido!' });
    } else {
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas. Verifique seu email e CPF.' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Ocorreu um erro no servidor.' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
