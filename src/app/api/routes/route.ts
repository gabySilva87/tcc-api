
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// A função GET é uma API Route que é acionada quando o frontend faz uma requisição
// do tipo GET para `/api/routes`.
export async function GET(request: Request) {
  let connection;
  try {
    // =======================================================================
    // PASSO 1: CONEXÃO COM O BANCO DE DADOS MYSQL
    // =======================================================================
    // Estabelece a conexão com o banco de dados usando as variáveis de ambiente.
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
    // A consulta foi atualizada para usar os nomes de coluna corretos da tb_encomenda
    // e fazer um JOIN com tb_endereco para obter a descrição do endereço.
    const [rows] = await connection.execute(
      `SELECT 
        e.id_encomenda, 
        e.nr_encomenda, 
        e.nm_cliente, 
        CONCAT(en.ds_logradouro, ', ', en.nr_logradouro, ' - ', en.nm_bairro, ', ', en.nm_cidade, ' - ', en.nm_uf) as ds_endereco,
        e.nm_status_encomenda, 
        e.created_at 
       FROM tb_encomenda e
       LEFT JOIN tb_endereco en ON e.cd_endereco = en.id_endereco
       WHERE e.nm_status_encomenda = 'pendente'`
    );

    // =======================================================================
    // PASSO 3: MAPEAMENTO E FORMATAÇÃO DOS DADOS
    // =======================================================================
    // Mapeia os resultados da consulta SQL para um formato de objeto que o frontend espera.
    // Isso desacopla a estrutura do banco de dados da estrutura da UI.
    const routes = (rows as any[]).map(row => ({
      id: row.id_encomenda,
      title: `Encomenda #${row.nr_encomenda}`, // Usa o número da encomenda como título.
      description: `Cliente: ${row.nm_cliente}`, // Usa o nome do cliente na descrição.
      address: row.ds_endereco || 'Endereço não disponível', // Endereço obtido do JOIN.
      status: row.nm_status_encomenda,
      // Formata a data de criação para exibir apenas a hora e o minuto no formato brasileiro.
      time: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false // Propriedade adicional que o frontend pode usar, não vem do banco.
    }));
    
    // =======================================================================
    // PASSO 4: RETORNAR OS DADOS FORMATADOS
    // =======================================================================
    // Retorna a lista de rotas formatadas como uma resposta JSON com status 200 (OK).
    return NextResponse.json(routes);

  } catch (error: any) {
    // Bloco de tratamento de erros de conexão ou consulta.
    console.error('[ERRO NA API DE ROTAS]:', error);

    // Define mensagens de erro mais claras com base no código do erro.
    let errorMessage = 'Ocorreu um erro ao buscar os dados das rotas.';
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = `Não foi possível conectar ao banco de dados em '${process.env.DB_HOST}'. Verifique o host e a porta.`;
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = `Acesso negado para o usuário '${process.env.DB_USER}'. Verifique as credenciais do banco de dados.`;
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = `Banco de dados '${process.env.DB_DATABASE}' não encontrado.`;
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = `Uma coluna na consulta não foi encontrada no banco de dados. Verifique a consulta SQL na API de rotas. Detalhes: ${error.message}`;
    }

    // Retorna uma resposta de erro com a mensagem apropriada e status 500.
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  } finally {
    // =======================================================================
    // PASSO 5: FECHAR A CONEXÃO
    // =======================================================================
    // Garante que a conexão com o banco de dados seja sempre fechada.
    if (connection) {
      await connection.end();
    }
  }
}
