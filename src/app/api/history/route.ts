import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

// Mapeamento de status do banco de dados para o frontend
const statusFrontendMap: { [key: string]: string } = {
  'Entregue': 'entregue',
  'Falha': 'falha',
  'Nentregue': 'falha',
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
        port: process.env.DB_PORT,
    });

    // Query SQL CORRIGIDA para buscar todos os dados necessários, incluindo o nome do produto.
    const [rows] = await connection.execute(
      `SELECT 
        re.id_roteiro AS id,
        e.id_encomenda AS encomendaId, 
        e.nr_encomenda AS title, 
        e.nm_encomenda AS productName, -- <<< CORRIGIDO: Buscando o nome do produto
        e.nm_cliente AS clientName,
        e.nm_status_encomenda AS status,
        CONCAT(COALESCE(end.nm_rua, end.nm_avenida, ''), ', ', end.nr_casa, ' - CEP: ', end.nr_cep) AS address,
        DATE_FORMAT(re.dt_entrega, '%d/%m/%Y às %H:%i') as deliveryDate
      FROM tb_roteiro_entrega re
      JOIN tb_encomenda e ON re.id_encomenda = e.id_encomenda
      LEFT JOIN tb_endereco end ON e.id_endereco = end.id_endereco
      WHERE re.id_motorista = ? AND e.nm_status_encomenda IN ('Entregue', 'Nentregue', 'Falha')
      ORDER BY re.updated_at DESC`,
      [driverId]
    );

    // Mapeia o resultado para corresponder à interface Route do frontend.
    const results = (rows as any[]).map(row => ({
        id: row.id,
        encomendaId: row.encomendaId,
        title: row.title,
        productName: row.productName, // <<< CORRIGIDO: Mapeando o nome do produto
        clientName: row.clientName,
        status: statusFrontendMap[row.status] || 'desconhecido',
        address: row.address,
        deliveryDate: row.deliveryDate,
    }));

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('[ERRO NA API DE HISTÓRICO]:', error);
    return NextResponse.json(
      { success: false, message: 'Erro no servidor ao buscar histórico.', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
