
import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

// Esta rota busca os detalhes de um motorista específico.
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
        port: process.env.DB_PORT, // Porta adicionada para consistência
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    // Consulta 100% corrigida com base no seu arquivo de schema (migration)
    const [rows] = await connection.execute(
      'SELECT nm_motorista, created_at, nr_contato FROM tb_motorista WHERE id_motorista = ?',
      [driverId]
    );

    const driverInfo = (rows as any)[0];

    if (!driverInfo) {
        return NextResponse.json(
            { success: false, message: 'Motorista não encontrado.' },
            { status: 404 }
        );
    }

    // Laravel cria a coluna `created_at` por padrão com `timestamps()`
    const formattedDate = new Date(driverInfo.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return NextResponse.json({
        name: driverInfo.nm_motorista,
        registrationDate: formattedDate,
        contactNumber: driverInfo.nr_contato,
    });

  } catch (error: any) {
    console.error('[ERRO NA API DE INFO DO MOTORISTA]:', error);
    
    let errorMessage = 'Ocorreu um erro no servidor ao buscar as informações do motorista.';
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Não foi possível conectar ao servidor de banco de dados. Verifique o endereço (DB_HOST) e a porta.';
        statusCode = 503; 
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        errorMessage = 'Acesso negado ao banco de dados. Verifique o usuário (DB_USER) e a senha (DB_PASSWORD).';
        statusCode = 401; 
    } else if (error.code === 'ER_BAD_DB_ERROR') {
        errorMessage = `O banco de dados \'${process.env.DB_DATABASE}\' não foi encontrado. Verifique o nome (DB_DATABASE).`;
        statusCode = 404; 
    }

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
