
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Rota 100% corrigida com base no schema do seu banco de dados
export async function POST(request: Request) {
  try {
    const { encomendaId, status, driverId, problem } = await request.json(); // O campo 'problem' é recebido, mas não será usado, pois não há coluna para ele

    if (!encomendaId || !status || !driverId) {
      return NextResponse.json(
        { message: 'Dados essenciais (encomendaId, status, driverId) estão faltando.' },
        { status: 400 }
      );
    }

    // --- Início da Lógica Corrigida ---

    // 1. Atualiza o status na tabela principal de encomendas
    // Usando os nomes de coluna corretos do seu schema: 'nm_status_encomenda', 'id_encomenda', 'id_motorista'
    const updateResult = await sql`
      UPDATE tb_encomenda
      SET nm_status_encomenda = ${status}
      WHERE id_encomenda = ${encomendaId} AND id_motorista = ${driverId};
    `;

    // Verifica se a linha foi realmente atualizada
    if (updateResult.rowCount === 0) {
      return NextResponse.json(
        { message: 'Falha ao atualizar: Encomenda não encontrada ou não pertence a este motorista.' },
        { status: 404 }
      );
    }

    // 2. Insere um registro na tabela de histórico
    // Usando apenas as colunas que existem: 'id_encomenda', 'id_motorista', 'nm_status'
    await sql`
      INSERT INTO tb_historico_status_encomenda (id_encomenda, id_motorista, nm_status)
      VALUES (${encomendaId}, ${driverId}, ${status});
    `;
    
    // 3. Busca os dados atualizados e completos para retornar ao frontend
    // Usando os nomes de coluna corretos: 'nm_cliente', 'nm_motorista', etc.
    const { rows: finalData } = await sql`
        SELECT 
            e.id_encomenda AS id,
            e.nm_encomenda AS title,
            e.nm_status_encomenda AS status,
            e.nm_cliente AS "clientName",
            m.nm_motorista AS "driverName"
        FROM 
            tb_encomenda e
        LEFT JOIN 
            tb_motorista m ON e.id_motorista = m.id_motorista
        WHERE 
            e.id_encomenda = ${encomendaId};
    `;
    
    if (finalData.length === 0) {
        return NextResponse.json({ message: 'Erro ao buscar os dados da encomenda após a atualização.' }, { status: 404 });
    }

    // --- Fim da Lógica Corrigida ---

    return NextResponse.json({ 
        message: 'Status atualizado e histórico registrado com sucesso!', 
        data: finalData[0] 
    });

  } catch (error: any) {
    // Log do erro real no console do servidor para depuração
    console.error('Erro detalhado na rota update-status:', error);
    return NextResponse.json(
      { message: 'Ocorreu um erro interno no servidor.', error: error.message },
      { status: 500 }
    );
  }
}
