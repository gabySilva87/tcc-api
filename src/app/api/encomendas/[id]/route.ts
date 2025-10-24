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

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id: encomendaId } = params; 
    const { status, driverId, details } = await request.json(); // 'details' será ignorado, pois não há coluna para ele.

    if (!encomendaId || !status || !driverId) {
        return NextResponse.json(
            { success: false, message: 'Dados incompletos são obrigatórios.' },
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
            port: 3307, 
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
                { success: false, message: `Encomenda com ID ${encomendaId} não encontrada ou o status já é o mesmo.` },
                { status: 404, headers: corsHeaders }
            );
        }

        // CORREÇÃO FINAL: Removida a coluna de detalhes da consulta INSERT.
        await connection.execute(
            'INSERT INTO tb_historico_status_encomenda (id_encomenda, id_motorista, nm_status) VALUES (?, ?, ?)',
            [encomendaId, driverId, formattedStatus]
        );

        await connection.commit();

        return NextResponse.json(
            { success: true, message: `Status da encomenda atualizado para ${formattedStatus}.` },
            { headers: corsHeaders }
        );

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error(`[ERRO NA API /api/encomendas/${encomendaId}]:`, error);
        
        return NextResponse.json(
            { success: false, message: "Ocorreu um erro no servidor." },
            { status: 500, headers: corsHeaders }
        );
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
