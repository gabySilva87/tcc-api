import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get('driverId');

  if (!driverId) {
    return NextResponse.json({ message: 'ID do motorista não fornecido.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    // Query SQL CORRIGIDA para buscar o nome do produto.
    const [rows] = await connection.execute(
      `SELECT
          r.id_roteiro AS id,
          e.id_encomenda AS encomendaId,
          e.nr_encomenda AS title,
          e.nm_encomenda AS productName, 
          e.nm_cliente AS clientName,
          e.nm_status_encomenda AS status,
          CONCAT(COALESCE(end.nm_rua, end.nm_avenida, ''), ', ', end.nr_casa, ' - CEP: ', end.nr_cep) AS address
      FROM tb_roteiro_entrega AS r
      JOIN tb_encomenda AS e ON r.id_encomenda = e.id_encomenda
      LEFT JOIN tb_endereco AS end ON e.id_endereco = end.id_endereco
      WHERE r.id_motorista = ? AND e.nm_status_encomenda = 'Transito' AND r.dt_entrega IS NULL
      ORDER BY r.created_at ASC`,
      [driverId]
    );

    return NextResponse.json(rows);

  } catch (error) {
    console.error('[ERRO NA API DE ROTAS]:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
