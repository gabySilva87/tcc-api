
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// API Route para criar uma nova encomenda.
export async function POST(request: Request) {
  // Extrai os dados da nova encomenda do corpo da requisição.
  const { nr_encomenda, nm_cliente, cd_contato_cliente, endereco } = await request.json();

  // Validação básica dos dados recebidos.
  if (!nr_encomenda || !nm_cliente || !endereco || !endereco.nr_cep || !endereco.nr_casa || !endereco.nm_rua) {
    return NextResponse.json(
      { success: false, message: 'Campos obrigatórios da encomenda ou endereço estão faltando.' },
      { status: 400 }
    );
  }

  let connection;
  try {
    // Conecta ao banco de dados.
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: 3307,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    // Inicia uma transação para garantir a consistência dos dados.
    await connection.beginTransaction();

    // =======================================================================
    // PASSO 1: INSERIR O ENDEREÇO
    // =======================================================================
    const [enderecoResult] = await connection.execute(
      'INSERT INTO endereco (nr_cep, nr_casa, nm_rua, nm_avenida, ds_complemento) VALUES (?, ?, ?, ?, ?)',
      [endereco.nr_cep, endereco.nr_casa, endereco.nm_rua, endereco.nm_avenida || null, endereco.ds_complemento || null]
    );

    const enderecoId = (enderecoResult as any).insertId;
    if (!enderecoId) {
      throw new Error('Falha ao obter o ID do endereço inserido.');
    }

    // =======================================================================
    // PASSO 2: INSERIR A ENCOMENDA
    // =======================================================================
    // O id_status_encomenda é definido como 1 (pendente) por padrão.
    const [encomendaResult] = await connection.execute(
      'INSERT INTO encomenda (nr_encomenda, nm_cliente, nr_contato_cliente, id_endereco, id_status_encomenda, dt_cadastro) VALUES (?, ?, ?, ?, 1, NOW())',
      [nr_encomenda, nm_cliente, cd_contato_cliente, enderecoId]
    );
    
    const encomendaId = (encomendaResult as any).insertId;

    // Confirma a transação, salvando todas as alterações.
    await connection.commit();

    // Retorna uma resposta de sucesso com o ID da nova encomenda.
    return NextResponse.json({
      success: true,
      message: 'Encomenda criada com sucesso!',
      encomendaId: encomendaId,
      enderecoId: enderecoId,
    }, { status: 201 }); // Status 201 (Created).

  } catch (error: any) {
    // Se ocorrer um erro, desfaz a transação para evitar dados parciais.
    if (connection) {
      await connection.rollback();
    }
    console.error('[ERRO NA API DE CRIAÇÃO DE ENCOMENDA]:', error);
    
    let errorMessage = 'Ocorreu um erro no servidor ao criar a encomenda.';
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        errorMessage = 'Acesso negado ao banco de dados. Verifique as credenciais (usuário/senha) no arquivo .env.';
    } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Não foi possível conectar ao banco de dados. Verifique se o servidor MySQL está rodando e se a porta está correta.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
        errorMessage = `O banco de dados '${process.env.DB_DATABASE}' não foi encontrado. Verifique se o nome está correto no .env.`;
    }

    // Retorna uma mensagem de erro genérica.
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  } finally {
    // Garante que a conexão com o banco de dados seja fechada.
    if (connection) {
      await connection.end();
    }
  }
}
