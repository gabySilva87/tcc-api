
import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import { decrypt } from '@/lib/crypto';
import { headers } from 'next/headers';

/**
 * API Route para buscar as rotas de entrega de um motorista.
 * ATUALMENTE EM MODO DE TESTE: Retorna dados mocados sem consultar o banco.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId');

  if (!driverId) {
    return NextResponse.json({ message: 'O ID do motorista é obrigatório.' }, { status: 400 });
  }

  // =======================================================================
  // MODO DE TESTE: DADOS MOCADOS
  // =======================================================================
  const mockRoutes = [
    {
      id: '1',
      title: 'Encomenda #ENC-001',
      description: 'Cliente: João da Silva',
      address: 'Rua das Flores, Nº 123, Apto 4B, Jardim Primavera, São Paulo - SP',
      status: 'pendente',
      time: '14/08/2024 10:30',
      read: false,
    },
    {
      id: '2',
      title: 'Encomenda #ENC-002',
      description: 'Cliente: Maria Oliveira',
      address: 'Avenida Brasil, Nº 1500, Centro, Rio de Janeiro - RJ',
      status: 'pendente',
      time: '14/08/2024 14:00',
      read: false,
    },
    {
      id: '3',
      title: 'Encomenda #ENC-003',
      description: 'Cliente: Pedro Martins',
      address: 'Praça da Sé, Nº 45, Lado Ímpar, Sé, São Paulo - SP',
      status: 'pendente',
      time: '14/08/2024 16:45',
      read: false,
    },
  ];

  // Simula um pequeno atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(mockRoutes);

  /*
  // CÓDIGO ORIGINAL COM CONEXÃO AO BANCO DE DADOS (TEMPORARIAMENTE DESABILITADO)

  interface CepApiResponse {
    success: boolean;
    data?: {
      logradouro: string;
      bairro: string;
      localidade: string;
      uf: string;
    };
    message?: string;
  }

  async function getAddressFromCep(cep: string): Promise<CepApiResponse['data'] | null> {
    try {
      const host = headers().get('host');
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;
      const response = await fetch(`${baseUrl}/api/cep/${cep}`);
      if (!response.ok) {
        console.warn(`[API de CEP] Falha na requisição para o CEP ${cep}. Status: ${response.status}`);
        return null;
      }
      const result: CepApiResponse = await response.json();
      return result.success && result.data ? result.data : null;
    } catch (error) {
      console.error(`[API de CEP] Exceção ao buscar CEP ${cep}:`, error);
      return null;
    }
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    const [rows] = await connection.execute(
      `SELECT 
        e.id_encomenda,
        e.nr_encomenda, 
        e.nm_cliente, 
        r.dt_entrega,
        end.nr_cep,
        end.nr_casa,
        end.ds_complemento
       FROM tb_roteiro_entrega AS r
       JOIN tb_encomenda AS e ON r.id_encomenda = e.id_encomenda
       LEFT JOIN tb_endereco AS end ON e.id_endereco = end.id_endereco
       WHERE r.id_motorista = ?`,
      [driverId]
    );

    const routesPromises = (rows as any[]).map(async (row) => {
      let decryptedCep: string | null = null;
      try {
        if (row.nr_cep) decryptedCep = decrypt(row.nr_cep);
      } catch (e) { console.error(`Falha ao descriptografar CEP para encomenda ${row.nr_encomenda}:`, e); }

      let decryptedNumero: string | null = null;
      try {
        if (row.nr_casa) decryptedNumero = decrypt(row.nr_casa);
      } catch (e) { console.error(`Falha ao descriptografar número para encomenda ${row.nr_encomenda}:`, e); }
      
      let decryptedComplemento: string | null = null;
      try {
        if (row.ds_complemento) decryptedComplemento = decrypt(row.ds_complemento);
      } catch (e) { console.error(`Falha ao descriptografar complemento para encomenda ${row.nr_encomenda}:`, e); }

      const addressDetails = decryptedCep ? await getAddressFromCep(decryptedCep) : null;

      const addressParts: string[] = [];
      if (addressDetails?.logradouro) addressParts.push(addressDetails.logradouro);
      if (decryptedNumero) addressParts.push(`Nº ${decryptedNumero}`);
      if (decryptedComplemento) addressParts.push(decryptedComplemento);
      if (addressDetails?.bairro) addressParts.push(addressDetails.bairro);
      if (addressDetails?.localidade && addressDetails?.uf) addressParts.push(`${addressDetails.localidade} - ${addressDetails.uf}`);
      
      let fullAddress = addressParts.join(', ');
      if (!fullAddress && decryptedCep) {
          fullAddress = `CEP: ${decryptedCep}`;
      } else if (!fullAddress) {
          fullAddress = 'Endereço indisponível';
      }
      
      let formattedTime = 'N/A';
      if (row.dt_entrega) {
        try {
          const deliveryDate = new Date(row.dt_entrega);
          if (!isNaN(deliveryDate.getTime())) {
            formattedTime = deliveryDate.toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }).replace(',', '');
          }
        } catch (e) {
          console.error(`Data de entrega inválida para encomenda ${row.nr_encomenda}: ${row.dt_entrega}`);
        }
      }

      return {
        id: row.id_encomenda,
        title: `Encomenda #${row.nr_encomenda}`,
        description: `Cliente: ${row.nm_cliente}`,
        address: fullAddress,
        status: 'pendente',
        time: formattedTime,
        read: false
      };
    });

    const routes = await Promise.all(routesPromises);
    
    return NextResponse.json(routes);

  } catch (error: any) {
    console.error('[ERRO NA API DE ROTAS]:', error);

    let errorMessage = 'Ocorreu um erro ao buscar os dados das rotas.';
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = `Não foi possível conectar ao servidor de banco de dados em '${process.env.DB_HOST}'. Verifique o DB_HOST e a porta.`;
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = `Acesso negado para o usuário '${process.env.DB_USER}'. Verifique as credenciais do banco.`;
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = `O banco de dados '${process.env.DB_DATABASE}' não foi encontrado.`;
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = `Coluna não encontrada. Verifique a consulta SQL. Detalhes: ${error.message}`;
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  */
}
