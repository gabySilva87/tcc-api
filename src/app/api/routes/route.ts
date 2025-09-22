import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  let connection;
  try {
    // =======================================================================
    // PASSO 1: CONEXÃO COM O MYSQL
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
    // PASSO 2: CONSULTA SQL
    // =======================================================================
    // Execute a consulta para buscar as encomendas pendentes.
    // Esta consulta foi atualizada para corresponder ao seu esquema de banco de dados.
    const [rows] = await connection.execute(
      'SELECT id_encomenda, nm_encomenda, ds_encomenda, created_at FROM tb_encomenda WHERE nm_status_encomenda = "pendente"'
    );

    // =======================================================================
    // PASSO 3: MAPEAMENTO DOS DADOS
    // =======================================================================
    // O frontend espera campos como 'id', 'title', 'description' e 'time'.
    // Mapeamos os resultados da sua tabela para o formato esperado.
    const routes = (rows as any[]).map(row => ({
      id: row.id_encomenda,
      title: row.nm_encomenda,
      description: row.ds_encomenda,
      time: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false // Assumindo que novas notificações não foram lidas
    }));
    
    // =======================================================================
    // PASSO 4: RETORNAR OS DADOS
    // =======================================================================
    return NextResponse.json(routes);

  } catch (error) {
    console.error('Erro na API ao buscar rotas:', error);
    // Em caso de erro, retornamos uma resposta de erro do servidor.
    return NextResponse.json(
      { message: 'Ocorreu um erro ao buscar os dados das rotas.' },
      { status: 500 }
    );
  } finally {
    // Garante que a conexão seja sempre fechada, mesmo se ocorrer um erro.
    if (connection) {
      await connection.end();
    }
  }
}
