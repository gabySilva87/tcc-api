
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// A função POST é uma API Route do Next.js. Ela é acionada quando o frontend
// faz uma requisição do tipo POST para a URL `/api/login`.
export async function POST(request: Request) {
  // Extrai o `usuario` e a `senha` do corpo da requisição JSON.
  const { usuario, senha } = await request.json();

  // Validação básica para garantir que ambos os campos foram enviados.
  if (!usuario || !senha) {
    return NextResponse.json(
      { success: false, message: 'Usuário e senha são obrigatórios.' },
      { status: 400 } // Retorna status 400 (Bad Request).
    );
  }

  let connection;
  try {
    // =======================================================================
    // PASSO 1: CONEXÃO COM O BANCO DE DADOS MYSQL
    // =======================================================================
    // Cria uma conexão com o banco de dados usando as credenciais do arquivo .env.local.
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER, // Usa a variável de ambiente correta.
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    // =======================================================================
    // PASSO 2: CONSULTA SQL PARA VERIFICAR AS CREDENCIAIS
    // =======================================================================
    // Busca o usuário, sua senha criptografada (HASHED) e o nome do motorista na tabela de motoristas.
    // Usar `?` como placeholder previne ataques de SQL Injection.
    const [rows] = await connection.execute(
      'SELECT nm_usuario, nr_senha, nm_motorista FROM tb_motorista WHERE nm_usuario = ?',
      [usuario]
    );

    // =======================================================================
    // PASSO 3: AVALIAÇÃO DO RESULTADO E RESPOSTA
    // =======================================================================
    // Verifica se a consulta retornou alguma linha (se o usuário foi encontrado).
    if (Array.isArray(rows) && rows.length > 0) {
      const driver = (rows as any)[0];
      
      // Verifica se a senha armazenada parece ser um hash bcrypt.
      // Hashes bcrypt geralmente começam com $2a$, $2b$ ou $2y$.
      const isHashed = driver.nr_senha.startsWith('$2');
      
      let senhaCorreta = false;
      if (isHashed) {
        // Se a senha no banco é um hash, usa bcrypt.compare.
        senhaCorreta = await bcrypt.compare(senha, driver.nr_senha);
      } else {
        // Se for texto puro, faz uma comparação simples.
        senhaCorreta = senha === driver.nr_senha;
      }
      
      if(senhaCorreta){
        // Se a senha estiver correta, retorna uma resposta de sucesso com o nome do motorista.
        return NextResponse.json({ success: true, message: 'Login bem-sucedido!', driverName: driver.nm_motorista });
      }
      else{
        // Se a senha estiver incorreta, retorna um erro de credenciais inválidas.
        return NextResponse.json(
          { success: false, message: 'Credenciais inválidas. Verifique seu usuário e senha.' },
          { status: 401 } // Status 401 (Unauthorized).
        );
      }
    }
    else{
      // Se o usuário não for encontrado no banco de dados.
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado.' },
        { status: 404 } // Status 404 (Not Found).
      );
    }
  } catch (error: any) {
    // Bloco de tratamento de erros para problemas de conexão ou de servidor.
    console.error('[ERRO NA API DE LOGIN]:', error);

    // Fornece mensagens de erro mais específicas com base no código do erro.
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
    // Se for um erro desconhecido, retorna uma mensagem genérica de erro de servidor.
    return NextResponse.json(
      { success: false, message: 'Ocorreu um erro no servidor. Verifique o console da aplicação para mais detalhes.' },
      { status: 500 } // Status 500 (Internal Server Error).
    );
  } finally {
    // O bloco `finally` garante que a conexão com o banco de dados seja fechada
    // independentemente de ter ocorrido sucesso ou erro.
    if (connection) {
      await connection.end();
    }
  }
}
