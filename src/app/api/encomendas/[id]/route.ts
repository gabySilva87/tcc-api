
import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

// Mapeamento de status para IDs (assumindo que existam no banco)
const statusMap: { [key: string]: number } = {
  pendente: 1,
  'em-transito': 2,
  entregue: 3,
  falha: 4,
};

/**
 * API Route para atualizar o status de uma encomenda.
 * Agora se conecta ao banco de dados para persistir as mudanças.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: encomendaId } = params;
  const body = await request.json();
  const { status, driverId } = body; // A foto é ignorada conforme solicitado.

  console.log(`[API REAL] Recebido pedido para atualizar encomenda ${encomendaId} para ${status}`);
  
  // Validação básica
  if (!encomendaId || !status || !driverId) {
    return NextResponse.json(
      { success: false, message: 'ID da encomenda, status e ID do motorista são obrigatórios.' },
      { status: 400 }
    );
  }
  
  const statusId = statusMap[status];
  if (!statusId) {
      return NextResponse.json({ success: false, message: 'Status inválido fornecido.' }, { status: 400 });
  }

  let connection;
  try {
    // Conecta ao banco de dados.
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });
    
    // Inicia uma transação
    await connection.beginTransaction();

    // Passo 1: Atualizar a tabela `encomenda` com o novo status
    await connection.execute(
        'UPDATE encomenda SET id_status_encomenda = ? WHERE id_encomenda = ?',
        [statusId, encomendaId]
    );

    // Passo 2: Inserir um novo registro na `historico_status_encomenda`
    // NOTA: A foto não é salva no banco, conforme solicitado. O motorista ID é necessário.
    await connection.execute(
      'INSERT INTO historico_status_encomenda (id_encomenda, id_status_encomenda, id_motorista, dt_mudanca) VALUES (?, ?, ?, NOW())',
      [encomendaId, statusId, driverId] // Usando o driverId recebido
    );
    
    // Confirma a transação
    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `Encomenda #${encomendaId} atualizada para '${status}' com sucesso.`,
    });

  } catch (error: any) {
    // Se ocorrer um erro, desfaz a transação.
    if (connection) {
      await connection.rollback();
    }
    console.error(`[ERRO NA API DE ATUALIZAÇÃO DE ENCOMENDA ${encomendaId}]:`, error);
    return NextResponse.json(
      { success: false, message: 'Ocorreu um erro no servidor ao atualizar a encomenda.' },
      { status: 500 }
    );
  } finally {
    // Garante que a conexão com o banco de dados seja fechada.
    if (connection) {
      await connection.end();
    }
  }
}
