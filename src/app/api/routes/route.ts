
import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

/**
 * API Route para buscar as rotas de entrega de um motorista.
 * Conecta-se ao banco de dados para buscar dados reais.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId');

  if (!driverId) {
    return NextResponse.json({ message: 'O ID do motorista é obrigatório.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: 3307,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    // Consulta SQL ajustada para o schema fornecido
    const [rows] = await connection.execute(
      `SELECT 
        e.id_encomenda,
        e.nr_encomenda, 
        e.nm_cliente, 
        r.dt_entrega,
        end.nr_cep,
        end.nr_casa,
        end.nm_rua,
        end.nm_avenida,
        end.ds_complemento,
        se.nm_status as status_nome
       FROM roteiro_entrega AS r
       JOIN encomenda AS e ON r.id_encomenda = e.id_encomenda
       LEFT JOIN endereco AS end ON e.id_endereco = end.id_endereco
       LEFT JOIN status_encomenda as se ON e.id_status_encomenda = se.id_status_encomenda
       WHERE r.id_motorista = ? AND e.id_status_encomenda = 1`, // Busca apenas pendentes (ID 1)
      [driverId]
    );

    const routes = (rows as any[]).map(row => {
      // Monta o endereço a partir das colunas do banco
      const addressParts: string[] = [];
      if (row.nm_rua) addressParts.push(row.nm_rua);
      if (row.nm_avenida) addressParts.push(row.nm_avenida);
      if (row.nr_casa) addressParts.push(`Nº ${row.nr_casa}`);
      if (row.ds_complemento) addressParts.push(row.ds_complemento);
      if (row.nr_cep) addressParts.push(`CEP: ${row.nr_cep}`);
      
      let fullAddress = addressParts.join(', ');
      if (!fullAddress) {
          fullAddress = 'Endereço indisponível';
      }
      
      let formattedTime = 'N/A';
      if (row.dt_entrega) {
        try {
          const deliveryDate = new Date(row.dt_entrega);
          if (!isNaN(deliveryDate.getTime())) {
            formattedTime = deliveryDate.toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }).replace(',', '');
          }
        } catch (e) {
          console.error(`Data de entrega inválida para encomenda ${row.nr_encomenda}: ${row.dt_entrega}`);
        }
      }

      return {
        id: row.id_encomenda,
        title: `Encomenda #${row.nr_encomenda}`,
        description: `Cliente: ${row.nm_cliente}`,
        address: fullAddress,
        status: 'pendente', // Status fixo, pois a query filtra por pendentes
        time: formattedTime,
        read: false
      };
    });
    
    return NextResponse.json(routes);

  } catch (error: any) {
    console.error('[ERRO NA API DE ROTAS]:', error);

    let errorMessage = 'Ocorreu um erro ao buscar os dados das rotas.';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Não foi possível conectar ao banco de dados. Verifique se o serviço MySQL está em execução e se a porta está correta.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Acesso negado ao banco de dados. Verifique as credenciais (usuário/senha) no arquivo .env.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = `O banco de dados '${process.env.DB_DATABASE}' não foi encontrado. Verifique se o nome está correto no .env.`;
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = `Coluna não encontrada na consulta SQL. Detalhes: ${error.message}`;
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
