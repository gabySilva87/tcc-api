import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// API ATUALIZADA COM LOGS DE DEPURAÇÃO E VERIFICAÇÃO DE LINHAS AFETADAS
export async function POST(request: Request) {
  const body = await request.json();
  // PASSO 1: Logar os dados recebidos para depuração.
  console.log('📦 [API update-status] Dados recebidos:', body);
  const { roteiroId, encomendaId, status, driverId, problemDetails } = body;

  if (!roteiroId || !encomendaId || !status || !driverId) {
    return NextResponse.json(
      { message: 'Dados essenciais (roteiroId, encomendaId, status, driverId) estão faltando.' },
      { status: 400 }
    );
  }

  let connection;
  try {
    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: 3307,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });
    
    await connection.beginTransaction();

    let historyLogStatus = status;
    // PASSO 2: Normalizar o status para evitar erros de case ou espaços.
    const normalizedStatus = status?.trim().toLowerCase();
    
    let totalAffectedRows = 0;

    if (normalizedStatus === 'Transito') {
      const [encomendaResult]: any = await connection.execute(
        'UPDATE tb_encomenda SET nm_status_encomenda = ? WHERE id_encomenda = ?',
        ['Transito', encomendaId]
      );
      const [roteiroResult]: any = await connection.execute(
        'UPDATE tb_roteiro SET nm_status = ? WHERE id_roteiro = ?',
        ['Em trânsito', roteiroId]
      );
      // PASSO 3: Logar o resultado do UPDATE.
      console.log(`🧾 [API update-status] Linhas atualizadas em tb_encomenda: ${encomendaResult.affectedRows}`);
      console.log(`🧾 [API update-status] Linhas atualizadas em tb_roteiro: ${roteiroResult.affectedRows}`);
      totalAffectedRows = encomendaResult.affectedRows + roteiroResult.affectedRows;

    } else if (normalizedStatus === 'entregue') {
      const [encomendaResult]: any = await connection.execute(
        'UPDATE tb_encomenda SET nm_status_encomenda = ? WHERE id_encomenda = ?',
        ['Entregue', encomendaId]
      );
      const [roteiroResult]: any = await connection.execute(
        'UPDATE tb_roteiro_entrega SET dt_entrega = NOW() WHERE id_roteiro = ?',
        [roteiroId]
      );
      console.log(`🧾 [API update-status] Linhas atualizadas em tb_encomenda: ${encomendaResult.affectedRows}`);
      console.log(`🧾 [API update-status] Linhas atualizadas em tb_roteiro_entrega: ${roteiroResult.affectedRows}`);
      totalAffectedRows = encomendaResult.affectedRows + roteiroResult.affectedRows;

    } else if (normalizedStatus === 'não entregue') {
      historyLogStatus = `Não Entregue: ${problemDetails || 'Motivo não especificado'}`;
      const [encomendaResult]: any = await connection.execute(
          'UPDATE tb_encomenda SET nm_status_encomenda = ? WHERE id_encomenda = ?',
          ['NEntregue', encomendaId]
      );
      const [roteiroResult]: any = await connection.execute(
          'UPDATE tb_roteiro_entrega SET nm_status = ? WHERE id_roteiro = ?',
          ['NEntregue', roteiroId]
      );
      console.log(`🧾 [API update-status] Linhas atualizadas em tb_encomenda: ${encomendaResult.affectedRows}`);
      console.log(`🧾 [API update-status] Linhas atualizadas em tb_roteiro_entrega: ${roteiroResult.affectedRows}`);
      totalAffectedRows = encomendaResult.affectedRows + roteiroResult.affectedRows;
    }

    // PASSO 4: Se nenhuma linha foi alterada, é um erro.
    if (totalAffectedRows === 0) {
        await connection.rollback();
        console.error(`[API update-status] NENHUMA LINHA ATUALIZADA para roteiroId: ${roteiroId}. A operação foi revertida.`);
        return NextResponse.json(
            { message: `Falha na atualização: O registro com roteiroId ${roteiroId} não foi encontrado ou já possui o status desejado.` },
            { status: 404 }
        );
    }
    
    await connection.execute(
      'INSERT INTO tb_historico_status_encomenda (id_encomenda, id_motorista, nm_status, created_at) VALUES (?, ?, ?, NOW())',
      [encomendaId, driverId, historyLogStatus]
    );

    await connection.commit();
    
    console.log('✅ [API update-status] Operação concluída e commitada com sucesso.');
    return NextResponse.json({ message: 'Status da encomenda atualizado com sucesso!' });

  } catch (error: any) {
    if (connection) {
      await connection.rollback();
    }
    console.error('[ERRO NA ROTA UPDATE-STATUS]:', error);
    return NextResponse.json(
      { message: 'Ocorreu um erro interno no servidor.', error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
