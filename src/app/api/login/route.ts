
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
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: 3307,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    // Consulta para buscar o motorista pelo nome de usuário.
    // O campo url_foto foi removido pois não existe no schema fornecido.
    const [rows] = await connection.execute(
      'SELECT id_motorista, nm_usuario, nr_senha, nm_motorista FROM tb_motorista WHERE nm_usuario = ?',
      [usuario]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const driver = (rows as any)[0];
      
      // Verifica se a senha no banco parece estar hasheada (padrão bcrypt)
      const isHashed = driver.nr_senha.startsWith('$2');
      
      let senhaCorreta = false;
      if (isHashed) {
        // Compara a senha fornecida com a senha hasheada do banco
        senhaCorreta = await bcrypt.compare(senha, driver.nr_senha);
      } else {
        // Comparação de texto plano se a senha não estiver hasheada
        senhaCorreta = senha === driver.nr_senha;
      }
      
      if(senhaCorreta){
        // Se a senha estiver correta, retorna sucesso com os dados do motorista.
        return NextResponse.json({ 
            success: true, 
            message: 'Login bem-sucedido!', 
            driverName: driver.nm_motorista,
            driverId: driver.id_motorista,
            driverPhotoUrl: null // Retorna nulo, pois o campo não existe no banco.
        });
      }
      else{
        // Se a senha estiver incorreta, retorna erro 401.
        return NextResponse.json(
          { success: false, message: 'Credenciais inválidas. Verifique seu usuário e senha.' },
          { status: 401 }
        );
      }
    }
    else{
      // Se o usuário não for encontrado, retorna erro 404.
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    // Tratamento de erros de conexão e outros erros do servidor.
    console.error('[ERRO NA API DE LOGIN]:', error);
    
    let errorMessage = 'Ocorreu um erro no servidor.';
    if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Não foi possível conectar ao servidor de banco de dados. Verifique se o serviço MySQL está em execução e se a porta está correta.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        errorMessage = 'Acesso negado ao banco de dados. Verifique o usuário e a senha no arquivo .env.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
        errorMessage = `O banco de dados '${process.env.DB_DATABASE}' não existe. Verifique o nome no arquivo .env.`;
    }

    // Erro genérico para outras falhas.
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  } finally {
    // Garante que a conexão com o banco seja sempre fechada.
    if (connection) {
      await connection.end();
    }
  }
}
