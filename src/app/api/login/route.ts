
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

  // =======================================================================
  // MODO DE TESTE: SIMULAÇÃO DE LOGIN SEM BANCO DE DADOS
  // =======================================================================
  // Para testar a interface, vamos simular um login se as credenciais forem corretas.
  if (usuario === 'test' && senha === 'test') {
    return NextResponse.json({ 
        success: true, 
        message: 'Login de teste bem-sucedido!', 
        driverName: 'Motorista Teste',
        driverId: '1' 
    });
  } else {
     return NextResponse.json(
        { success: false, message: 'Credenciais inválidas. Use "test" e "test" para entrar.' },
        { status: 401 }
      );
  }

  /*
  // CÓDIGO ORIGINAL COM CONEXÃO AO BANCO DE DADOS (TEMPORARIAMENTE DESABILITADO)
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

    const [rows] = await connection.execute(
      'SELECT id_motorista, nm_usuario, nr_senha, nm_motorista FROM tb_motorista WHERE nm_usuario = ?',
      [usuario]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const driver = (rows as any)[0];
      
      const isHashed = driver.nr_senha.startsWith('$2');
      
      let senhaCorreta = false;
      if (isHashed) {
        senhaCorreta = await bcrypt.compare(senha, driver.nr_senha);
      } else {
        senhaCorreta = senha === driver.nr_senha;
      }
      
      if(senhaCorreta){
        return NextResponse.json({ 
            success: true, 
            message: 'Login bem-sucedido!', 
            driverName: driver.nm_motorista,
            driverId: driver.id_motorista 
        });
      }
      else{
        return NextResponse.json(
          { success: false, message: 'Credenciais inválidas. Verifique seu usuário e senha.' },
          { status: 401 }
        );
      }
    }
    else{
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado.' },
        { status: 404 }
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
  */
}
