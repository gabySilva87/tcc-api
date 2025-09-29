import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import { decrypt } from '@/lib/crypto';
import { headers } from 'next/headers';

// Interface de resposta de CEP
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

/**
 * Tenta buscar detalhes do endereço primeiro na API interna,
 * e caso falhe, usa o ViaCEP como fallback.
 */
async function getAddressFromCep(cep: string): Promise<CepApiResponse['data'] | null> {
  try {
    // API interna
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/cep/${cep}`);
    const result: CepApiResponse = await response.json();

    if (result.success && result.data) {
      return result.data;
    }
    console.warn(`[API interna] CEP não encontrado: ${cep}`);
  } catch (error) {
    console.error(`[API interna] Falha ao buscar CEP ${cep}:`, error);
  }

  // Fallback para ViaCEP
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const result = await response.json();

    if (!result.erro) {
      return {
        logradouro: result.logradouro || '',
        bairro: result.bairro || '',
        localidade: result.localidade || '',
        uf: result.uf || '',
      };
    }
    console.warn(`[ViaCEP] CEP não encontrado: ${cep}`);
  } catch (error) {
    console.error(`[ViaCEP] Falha ao buscar CEP ${cep}:`, error);
  }

  return null;
}

// Rota GET
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId');

  if (!driverId) {
    return NextResponse.json({ message: 'O ID do motorista é obrigatório.' }, { status: 400 });
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
      let decryptedNumero = '';
      let decryptedComplemento = '';

      try {
        if (row.nr_cep) decryptedCep = decrypt(row.nr_cep);
      } catch {
        console.error(`Falha ao descriptografar CEP da encomenda ${row.nr_encomenda}`);
      }

      try {
        if (row.nr_casa) decryptedNumero = decrypt(row.nr_casa);
      } catch {
        console.error(`Falha ao descriptografar número da encomenda ${row.nr_encomenda}`);
      }

      try {
        if (row.ds_complemento) decryptedComplemento = decrypt(row.ds_complemento);
      } catch {
        console.error(`Falha ao descriptografar complemento da encomenda ${row.nr_encomenda}`);
      }

      let addressDetails = null;
      if (decryptedCep) {
        addressDetails = await getAddressFromCep(decryptedCep);
      }

      // Monta o endereço final com o que estiver disponível
      const addressParts: string[] = [];
      if (addressDetails) {
        if (addressDetails.logradouro) addressParts.push(addressDetails.logradouro);
        if (decryptedNumero) addressParts.push(`Nº ${decryptedNumero}`);
        if (decryptedComplemento) addressParts.push(decryptedComplemento);
        if (addressDetails.bairro) addressParts.push(addressDetails.bairro);
        if (addressDetails.localidade && addressDetails.uf) {
          addressParts.push(`${addressDetails.localidade} - ${addressDetails.uf}`);
        }
      } else {
        if (decryptedCep) addressParts.push(`CEP: ${decryptedCep}`);
        if (decryptedNumero) addressParts.push(`Nº ${decryptedNumero}`);
        if (decryptedComplemento) addressParts.push(decryptedComplemento);
      }

      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Endereço indisponível';

      // Formatação da data de entrega
      let formattedTime = 'N/A';
      if (row.dt_entrega) {
        const deliveryDate = new Date(row.dt_entrega);
        if (!isNaN(deliveryDate.getTime())) {
          formattedTime = deliveryDate
            .toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            .replace(',', '');
        }
      }

      return {
        id: row.id_encomenda,
        title: `Encomenda #${row.nr_encomenda}`,
        description: `Cliente: ${row.nm_cliente}`,
        address: fullAddress,
        status: 'pendente',
        time: formattedTime,
        read: false,
      };
    });

    const routes = await Promise.all(routesPromises);
    return NextResponse.json(routes);
  } catch (error: any) {
    console.error('[ERRO NA API DE ROTAS]:', error);

    let errorMessage = 'Ocorreu um erro ao buscar os dados das rotas.';
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = `Não foi possível conectar ao banco de dados em '${process.env.DB_HOST}'.`;
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = `Acesso negado para o usuário '${process.env.DB_USER}'.`;
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = `Banco de dados '${process.env.DB_DATABASE}' não encontrado.`;
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = `Coluna não encontrada. Verifique a consulta SQL. Detalhes: ${error.message}`;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
