import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// A função POST é acionada quando o formulário de login é enviado.
export async function POST(request: Request) {
  // Extrai o nome e o CPF do corpo da requisição.
  const { nome, cpf } = await request.json();

  // Validação básica para garantir que ambos os campos foram enviados.
  if (!nome || !cpf) {
    return NextResponse.json(
      { success: false, message: 'Nome e CPF são obrigatórios.' },
      { status: 400 }
    );
  }

  let connection;
  try {
    // =======================================================================
    // PASSO 1: CONEXÃO COM O BANCO DE DADOS MYSQL
    // =======================================================================
    // As credenciais são lidas de forma segura a partir de variáveis de ambiente
    // do seu arquivo .env.local. A opção SSL é adicionada para compatibilidade.
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
    // Executa uma consulta na tabela `tb_motorista` para encontrar um motorista
    // que corresponda ao nome e CPF fornecidos.
    const [rows] = await connection.execute(
      'SELECT * FROM tb_motorista WHERE nm_motorista = ? AND nr_cpf = ?',
      [nome, cpf]
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
        { success: false, message: 'Credenciais inválidas. Verifique seu nome e CPF.' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    // Em caso de erro (ex: falha na conexão com o banco), loga o erro no console
    // e retorna uma resposta de erro genérica e mais informativa.
    console.error('[ERRO NA API DE LOGIN]:', error); // Log detalhado do erro no terminal
    
    // Verificar se o erro é de conexão
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
