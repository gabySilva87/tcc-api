import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// A função POST é acionada quando o formulário de login é enviado.
export async function POST(request: Request) {
  // Extrai o email e a senha do corpo da requisição.
  const { email, senha } = await request.json();

  // Validação básica para garantir que ambos os campos foram enviados.
  if (!email || !senha) {
    return NextResponse.json(
      { success: false, message: 'Email e senha são obrigatórios.' },
      { status: 400 }
    );
  }

  let connection;
  try {
    // =======================================================================
    // PASSO 1: CONEXÃO COM O BANCO DE DADOS MYSQL
    // =======================================================================
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    // =======================================================================
    // PASSO 2: CONSULTA SQL PARA VERIFICAR AS CREDENCIAIS
    // =======================================================================
    const [rows] = await connection.execute(
      'SELECT nm_motorista FROM tb_motorista WHERE nm_email = ? AND nm_senha = ?',
      [email, senha]
    );

    // =======================================================================
    // PASSO 3: AVALIAÇÃO DO RESULTADO E RESPOSTA
    // =======================================================================
    if (Array.isArray(rows) && rows.length > 0) {
      const driver = (rows as any)[0];
      // Retorna sucesso e o nome do motorista.
      return NextResponse.json({ success: true, message: 'Login bem-sucedido!', driverName: driver.nm_motorista });
    } else {
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas. Verifique seu email e senha.' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('[ERRO NA API DE LOGIN]:', error);

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
         return NextResponse.json(
            { success: false, message: `Não foi possível conectar ao servidor de banco de dados em '${process.env.DB_HOST}'. Verifique o DB_HOST e a porta.` },
            { status: 500 }
        );
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        return NextResponse.json(
            { success: false, message: `Acesso negado para o usuário '${process.env.DB_USER}'. Verifique o usuário e a senha do banco de dados.` },
            { status: 500 }
        );
    }
    if (error.code === 'ER_BAD_DB_ERROR') {
        return NextResponse.json(
            { success: false, message: `O banco de dados '${process.env.DB_DATABASE}' não foi encontrado no host. Verifique a variável DB_DATABASE.` },
            { status: 500 }
        );
    }
    return NextResponse.json(
      { success: false, message: 'Ocorreu um erro no servidor. Verifique o console da aplicação para mais detalhes.' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
