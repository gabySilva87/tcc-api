import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// A função GET é acionada quando o frontend faz uma requisição para /api/routes.
export async function GET(request: Request) {
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
    // PASSO 2: CONSULTA SQL PARA BUSCAR DADOS
    // =======================================================================
    // Executa a consulta para buscar as encomendas com status "pendente".
    // Esta consulta foi atualizada para corresponder ao seu esquema de banco de dados.
    const [rows] = await connection.execute(
      'SELECT id_encomenda, nm_encomenda, ds_encomenda, created_at FROM tb_encomenda WHERE nm_status_encomenda = "pendente"'
    );

    // =======================================================================
    // PASSO 3: MAPEAMENTO E FORMATAÇÃO DOS DADOS
    // =======================================================================
    // O componente do frontend espera campos como 'id', 'title', 'description' e 'time'.
    // Mapeamos os resultados da sua tabela para o formato que o frontend espera.
    const routes = (rows as any[]).map(row => ({
      id: row.id_encomenda,
      title: row.nm_encomenda,
      description: row.ds_encomenda,
      time: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false // Assumimos que notificações de novas encomendas ainda não foram lidas.
    }));
    
    // =======================================================================
    // PASSO 4: RETORNAR OS DADOS FORMATADOS
    // =======================================================================
    // Retorna os dados mapeados em formato JSON.
    return NextResponse.json(routes);

  } catch (error: any) {
    // Em caso de erro (ex: falha na conexão), loga o erro no console.
    console.error('[ERRO NA API DE ROTAS]:', error); // Log detalhado do erro no terminal

    // Devolve uma mensagem de erro mais específica para o frontend.
    let errorMessage = 'Ocorreu um erro ao buscar os dados das rotas.';
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = `Não foi possível conectar ao banco de dados em '${process.env.DB_HOST}'. Verifique o host e a porta.`;
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = `Acesso negado para o usuário '${process.env.DB_USER}'. Verifique as credenciais do banco de dados.`;
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = `Banco de dados '${process.env.DB_DATABASE}' não encontrado.`;
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  } finally {
    // =======================================================================
    // PASSO 5: FECHAR A CONEXÃO
    // =======================================================================
    // Garante que a conexão com o banco de dados seja sempre fechada,
    // independentemente de sucesso ou falha.
    if (connection) {
      await connection.end();
    }
  }
}
