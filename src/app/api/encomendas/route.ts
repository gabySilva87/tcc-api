
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { encrypt } from '@/lib/crypto';

// API Route para criar uma nova encomenda.
export async function POST(request: Request) {
  // Extrai os dados da nova encomenda do corpo da requisição.
  const { nr_encomenda, nm_cliente, cd_contato_cliente, endereco } = await request.json();

  // Validação básica dos dados recebidos.
  if (!nr_encomenda || !nm_cliente || !endereco || !endereco.nr_cep || !endereco.nr_casa) {
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
      port: Number(process.env.DB_PORT),
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
    // Criptografa os dados do endereço antes de salvar.
    const encryptedCep = encrypt(endereco.nr_cep);
    const encryptedCasa = encrypt(endereco.nr_casa);
    const encryptedComplemento = endereco.ds_complemento ? encrypt(endereco.ds_complemento) : null;
    
    // Insere o endereço na tabela `tb_endereco`.
    const [enderecoResult] = await connection.execute(
      'INSERT INTO tb_endereco (nr_cep, nr_casa, ds_complemento, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [encryptedCep, encryptedCasa, encryptedComplemento]
    );

    const enderecoId = (enderecoResult as any).insertId;
    if (!enderecoId) {
      throw new Error('Falha ao obter o ID do endereço inserido.');
    }

    // =======================================================================
    // PASSO 2: INSERIR A ENCOMENDA
    // =======================================================================
    // Insere a encomenda na tabela `tb_encomenda`, usando o ID do endereço criado.
    const [encomendaResult] = await connection.execute(
      'INSERT INTO tb_encomenda (nr_encomenda, nm_cliente, cd_contato_cliente, cd_endereco, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
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
    
    // Retorna uma mensagem de erro genérica.
    return NextResponse.json(
      { success: false, message: 'Ocorreu um erro no servidor ao criar a encomenda.' },
      { status: 500 }
    );
  } finally {
    // Garante que a conexão com o banco de dados seja fechada.
    if (connection) {
      await connection.end();
    }
  }
}
