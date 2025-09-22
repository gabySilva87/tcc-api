import { NextResponse } from 'next/server';
// O pacote 'mysql2/promise' é ideal para usar com async/await.
import mysql from 'mysql2/promise';

// Esta é a rota da API que se conectará ao seu banco de dados MySQL.
// O pacote `mysql2` foi adicionado ao seu `package.json`.

export async function GET(request: Request) {
  try {
    // =======================================================================
    // PASSO 1: CONEXÃO COM O MYSQL
    // =======================================================================
    // As credenciais são lidas de forma segura a partir de variáveis de ambiente
    // do seu arquivo .env.local.
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    // =======================================================================
    // PASSO 2: CONSULTA SQL
    // =======================================================================
    // Execute a consulta para buscar as rotas.
    // Você pode querer filtrar por ID do motorista, etc.
    const [rows, fields] = await connection.execute('SELECT * FROM rotas WHERE status = "pendente"');

    // =======================================================================
    // PASSO 3: RETORNAR OS DADOS
    // =======================================================================
    // Após buscar os dados, feche a conexão.
    await connection.end();

    // Retorna as linhas (rows) do seu banco de dados como JSON.
    return NextResponse.json(rows);

  } catch (error) {
    console.error('Erro na API ao buscar rotas:', error);
    // Em caso de erro, retornamos uma resposta de erro do servidor.
    return NextResponse.json(
      { message: 'Ocorreu um erro ao buscar os dados das rotas.' },
      { status: 500 }
    );
  }
}
