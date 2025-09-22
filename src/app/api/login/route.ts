import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// A função POST é acionada quando o formulário de login é enviado.
export async function POST(request: Request) {
  // Extrai o email e o CPF do corpo da requisição.
  const { email, cpf } = await request.json();

  // Validação básica para garantir que ambos os campos foram enviados.
  if (!email || !cpf) {
    return NextResponse.json(
      { success: false, message: 'Email e CPF são obrigatórios.' },
      { status: 400 }
    );
  }

  let connection;
  try {
    // =======================================================================
    // PASSO 1: CONEXÃO COM O BANCO DE DADOS MYSQL
    // =======================================================================
    // As credenciais são lidas de forma segura a partir de variáveis de ambiente
    // do seu arquivo .env.local.
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    // =======================================================================
    // PASSO 2: CONSULTA SQL PARA VERIFICAR AS CREDENCIAIS
    // =======================================================================
    // Executa uma consulta na tabela `tb_motorista` para encontrar um motorista
    // que corresponda ao email e CPF fornecidos.
    // NOTA: Para que isso funcione, é necessário que exista uma coluna 'email' na sua
    // tabela `tb_motorista`. O esquema que você enviou não continha essa coluna.
    const [rows] = await connection.execute(
      'SELECT * FROM tb_motorista WHERE email = ? AND nr_cpf = ?',
      [email, cpf]
    );

    // =======================================================================
    // PASSO 3: AVALIAÇÃO DO RESULTADO E RESPOSTA
    // =======================================================================
    // Se a consulta retornar pelo menos uma linha, significa que o motorista foi encontrado.
    if (Array.isArray(rows) && rows.length > 0) {
      // Login bem-sucedido. Em um aplicativo real, aqui você geraria um token de sessão (JWT).
      return NextResponse.json({ success: true, message: 'Login bem-sucedido!' });
    } else {
      // Se nenhuma linha for encontrada, as credenciais são inválidas.
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas. Verifique seu email e CPF.' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    // Em caso de erro (ex: falha na conexão com o banco), loga o erro no console
    // e retorna uma resposta de erro genérica.
    console.error('Erro na API de Login:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Ocorreu um erro no servidor.' },
      { status: 500 }
    );
  } finally {
    // =======================================================================
    // PASSO 4: FECHAR A CONEXÃO
    // =======================================================================
    // Garante que a conexão com o banco de dados seja sempre fechada,
    // independentemente de sucesso ou falha.
    if (connection) {
      await connection.end();
    }
  }
}
