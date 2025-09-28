
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
    // A consulta junta tb_encomenda com tb_endereco para obter os detalhes completos.
    const [rows] = await connection.execute(
      `SELECT 
        e.id_encomenda,
        e.nr_encomenda, 
        e.nm_cliente, 
        e.created_at,
        end.nr_cep,
        end.nr_casa,
        end.ds_complemento
       FROM tb_encomenda as e
       LEFT JOIN tb_endereco as end ON e.cd_endereco = end.id_endereco`
    );

    // =======================================================================
    // PASSO 3: MAPEAMENTO E DESCRIPTOGRAFIA DOS DADOS
    // =======================================================================
    const routes = (rows as any[]).map(row => {
      try {
        const cep = row.nr_cep ? `CEP: ${decrypt(row.nr_cep)}` : '';
        const numero = row.nr_casa ? `Nº ${decrypt(row.nr_casa)}` : '';
        const complemento = row.ds_complemento ? decrypt(row.ds_complemento) : '';

        // Formata o endereço completo de forma mais legível com as colunas existentes.
        const fullAddress = [cep, numero, complemento].filter(Boolean).join(', ');

        return {
          id: row.id_encomenda,
          title: `Encomenda #${row.nr_encomenda}`,
          description: `Cliente: ${row.nm_cliente}`,
          address: fullAddress || 'Endereço indisponível',
          status: 'pendente', // Status definido estaticamente para manter a UI.
          time: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          read: false
        };
      } catch (e) {
        console.error(`Falha ao descriptografar dados para a encomenda #${row.nr_encomenda}:`, e);
        return {
          id: row.id_encomenda,
          title: `Encomenda #${row.nr_encomenda}`,
          description: `Cliente: ${row.nm_cliente}`,
          address: 'Erro ao processar endereço',
          status: 'pendente',
          time: 'N/A',
          read: false
        };
      }
    });
    
    // =======================================================================
    // PASSO 4: RETORNAR OS DADOS FORMATADOS
    // =======================================================================
    return NextResponse.json(routes);

  } catch (error: any) {
    console.error('[ERRO NA API DE ROTAS]:', error);

    let errorMessage = 'Ocorreu um erro ao buscar os dados das rotas.';
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = `Não foi possível conectar ao banco de dados em '${process.env.DB_HOST}'.`;
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = `Acesso negado para o usuário '${process.env.DB_USER}'.`;
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = `Banco de dados '${process.env.DB_DATABASE}' não encontrado.`;
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = `Coluna não encontrada. Verifique a consulta SQL. Detalhes: ${error.message}`;
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  } finally {
    // =======================================================================
    // PASSO 5: FECHAR A CONEXÃO
    // =======================================================================
    if (connection) {
      await connection.end();
    }
  }
}
