import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

const statusFrontendMap: { [key: string]: string } = {
  'Entregue': 'entregue',
  'NEntregue': 'nentregue',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const driverId = searchParams.get('driverId');

  if (!driverId) {
    return NextResponse.json(
      { success: false, message: 'ID do motorista é obrigatório.' },
      { status: 400 }
    );
  }

  let connection;
  try {
    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: Number(process.env.DB_PORT),
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    // CORREÇÃO: Lógica alinhada para buscar o histórico pela tb_encomenda.
    const [rows] = await connection.execute(
      `SELECT 
        e.id_encomenda as id, 
        e.nr_encomenda as title, 
        e.nm_cliente as description, 
        en.nm_rua, 
        en.nr_casa, 
        en.nm_avenida, 
        en.ds_complemento, 
        en.nr_cep,
        e.nm_status_encomenda as statusName,
        DATE_FORMAT(e.updated_at, '%H:%i') as time
      FROM tb_encomenda e
      LEFT JOIN tb_endereco en ON e.id_endereco = en.id_endereco
      WHERE e.id_motorista = ? AND e.nm_status_encomenda IN ('Entregue', 'Falha')
      ORDER BY e.updated_at DESC, e.id_encomenda DESC`,
      [driverId]
    );

    const results = (rows as any[]).map(row => {
        const addressParts = [];
        if (row.nm_rua) addressParts.push(row.nm_rua);
        if (row.nm_avenida && !row.nm_rua) addressParts.push(row.nm_avenida);
        if (row.nr_casa) addressParts.push('Nº ' + row.nr_casa);
        if (row.ds_complemento) addressParts.push(row.ds_complemento);
        if (row.nr_cep) addressParts.push('- CEP: ' + row.nr_cep);

        return {
            id: row.id,
            title: `Encomenda #${row.title}`,
            description: row.description,
            time: row.time,
            address: addressParts.join(', '),
            status: statusFrontendMap[row.statusName] || 'desconhecido',
        }
    });

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('[ERRO NA API DE HISTÓRICO]:', error);
    
    let errorMessage = 'Ocorreu um erro no servidor ao buscar o histórico.';
    let statusCode = 500;

    return NextResponse.json(
      { success: false, message: errorMessage, error: error.message },
      { status: statusCode }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
