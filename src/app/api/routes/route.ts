
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { decrypt } from '@/lib/crypto';

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
    // A consulta junta tb_encomenda com tb_endereco para obter os detalhes do endereço.
    // Filtra pelo status 'pendente'.
    const [rows] = await connection.execute(
      `SELECT 
        e.id_encomenda, 
        e.nr_encomenda, 
        e.nm_cliente, 
        e.ds_status, 
        e.created_at,
        end.nr_cep,
        end.nr_casa,
        end.ds_complemento,
        end.nm_bairro,
        end.nm_cidade,
        end.nm_estado
       FROM tb_encomenda as e
       LEFT JOIN tb_endereco as end ON e.cd_endereco = end.cd_endereco
       WHERE e.ds_status = 'pendente'`
    );

    // =======================================================================
    // PASSO 3: MAPEAMENTO E DESCRIPTOGRAFIA DOS DADOS
    // =======================================================================
    // Mapeia os resultados da consulta SQL para um formato que o frontend espera.
    // Descriptografa os campos de endereço antes de enviá-los.
    const routes = (rows as any[]).map(row => {
      // Tenta descriptografar cada parte do endereço. Se falhar, usa um valor padrão.
      try {
        const cep = row.nr_cep ? decrypt(row.nr_cep) : '';
        const numero = row.nr_casa ? decrypt(row.nr_casa) : '';
        const complemento = row.ds_complemento ? decrypt(row.ds_complemento) : '';
        const bairro = row.nm_bairro ? decrypt(row.nm_bairro) : '';
        const cidade = row.nm_cidade ? decrypt(row.nm_cidade) : '';
        const estado = row.nm_estado ? decrypt(row.nm_estado) : '';

        // Formata o endereço completo.
        const fullAddress = [cep, bairro, cidade, estado, numero, complemento].filter(Boolean).join(', ');

        return {
          id: row.id_encomenda,
          title: `Encomenda #${row.nr_encomenda}`,
          description: `Cliente: ${row.nm_cliente}`,
          address: fullAddress || 'Endereço indisponível',
          status: row.ds_status,
          time: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          read: false
        };
      } catch (e) {
        console.error(`Falha ao descriptografar dados para a encomenda ID ${row.id_encomenda}:`, e);
        // Retorna um objeto de rota com endereço de fallback em caso de erro.
        return {
          id: row.id_encomenda,
          title: `Encomenda #${row.nr_encomenda}`,
          description: `Cliente: ${row.nm_cliente}`,
          address: 'Erro ao processar endereço',
          status: row.ds_status,
          time: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          read: false
        };
      }
    });
    
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
