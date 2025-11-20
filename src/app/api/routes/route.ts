import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

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
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    // CORREÇÃO: Status alterado para 'Transito' e busca direta na tb_encomenda.
    const [rows] = await connection.execute(
      `SELECT 
        e.id_encomenda,
        e.nr_encomenda, 
        e.nm_cliente, 
        e.updated_at as dt_entrega,
        end.nr_cep,
        end.nr_casa,
        end.nm_rua,
        end.nm_avenida,
        end.ds_complemento,
        e.nm_status_encomenda as status_nome
       FROM tb_encomenda AS e
       LEFT JOIN tb_endereco AS end ON e.id_endereco = end.id_endereco
       WHERE e.id_motorista = ? AND e.nm_status_encomenda = 'Transito'
       ORDER BY e.updated_at ASC, e.id_encomenda ASC`,
      [driverId]
    );

    const routes = (rows as any[]).map(row => {
        const addressParts = [];
        if (row.nm_rua) addressParts.push(row.nm_rua);
        if (row.nm_avenida && !row.nm_rua) addressParts.push(row.nm_avenida);
        if (row.nr_casa) addressParts.push('Nº ' + row.nr_casa);
        if (row.ds_complemento) addressParts.push(row.ds_complemento);
        if (row.nr_cep) addressParts.push('- CEP: ' + row.nr_cep);

        return {
            id: row.id_encomenda,
            title: `Encomenda #${row.nr_encomenda}`,
            description: `Cliente: ${row.nm_cliente}`,
            time: row.dt_entrega ? new Date(row.dt_entrega).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            address: addressParts.join(', '),
            status: row.status_nome.toLowerCase(),
        }
    });

    return NextResponse.json(routes);

  } catch (error: any) {
    console.error('[ERRO NA API DE ROTAS]:', error);
    return NextResponse.json(
      { message: `Erro ao processar a solicitação. Detalhes: ${error.message}` },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
