import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

const capitalize = (s: string) => {
  if (typeof s !== 'string' || s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export async function POST(request: NextRequest) {
  const { encomendaId, status, driverId } = await request.json();

  if (!encomendaId || !status || !driverId) {
    return NextResponse.json(
      { success: false, message: 'Campos obrigatórios: encomendaId, status, driverId.' },
      { status: 400, headers: corsHeaders }
    );
  }

  const formattedStatus = capitalize(status);
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

    await connection.beginTransaction();

    const [updateResult] = await connection.execute(
      'UPDATE tb_encomenda SET nm_status_encomenda = ? WHERE id_encomenda = ?',
      [formattedStatus, encomendaId]
    );

    if ((updateResult as any).affectedRows === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: `Encomenda ${encomendaId} não encontrada.` },
        { status: 404, headers: corsHeaders }
      );
    }

    await connection.execute(
      'INSERT INTO tb_historico_status_encomenda (id_encomenda, id_motorista, nm_status) VALUES (?, ?, ?)',
      [encomendaId, driverId, formattedStatus]
    );

    await connection.commit();

    return NextResponse.json(
      { success: true, message: `Status atualizado para ${formattedStatus}.` },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Erro na atualização:', error);
    return NextResponse.json(
      { success: false, message: 'Erro no servidor.', error: error.message },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    if (connection) await connection.end();
  }
}
