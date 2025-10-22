
import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import { decrypt } from '@/lib/crypto';
import { headers } from 'next/headers';

// Interface para a resposta da nossa API de CEP interna
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
 * Função auxiliar para buscar detalhes do endereço a partir de um CEP.
 * @param cep - O CEP a ser consultado (já descriptografado).
 * @returns Os dados do endereço ou null em caso de erro.
 */
async function getAddressFromCep(cep: string): Promise<CepApiResponse['data'] | null> {
  try {
    // Constrói a URL para a nossa API de CEP interna
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const response = await fetch(`${baseUrl}/api/cep/${cep}`);
    
    // Se a resposta não for OK, não podemos converter para JSON.
    if (!response.ok) {
        console.warn(`[API de CEP] Falha na requisição para o CEP ${cep}. Status: ${response.status}`);
        return null;
    }

    const result: CepApiResponse = await response.json();

    if (result.success && result.data) {
      return result.data;
    }
    console.warn(`[API de CEP] Resposta sem sucesso ou sem dados para o CEP: ${cep}`);
    return null;
  } catch (error) {
    console.error(`[API de CEP] Exceção ao buscar CEP ${cep}:`, error);
    return null;
  }
}


// A função GET é uma API Route que é acionada quando o frontend faz uma requisição
// do tipo GET para `/api/routes`.
export async function GET(request: NextRequest) {
  // Extrai os parâmetros da URL, especificamente o `driverId`.
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId');
  
  // Se o `driverId` não for fornecido, retorna um erro.
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
      // Etapa 1: Descriptografia segura e individual
      let decryptedCep: string | null = null;
      let decryptedNumero: string | null = null;
      let decryptedComplemento: string | null = null;

      try {
        if (row.nr_cep) decryptedCep = decrypt(row.nr_cep);
      } catch (e) { console.error(`Falha ao descriptografar CEP para encomenda ${row.nr_encomenda}:`, e); }

      try {
        if (row.nr_casa) decryptedNumero = decrypt(row.nr_casa);
      } catch (e) { console.error(`Falha ao descriptografar número para encomenda ${row.nr_encomenda}:`, e); }
      
      try {
        if (row.ds_complemento) decryptedComplemento = decrypt(row.ds_complemento);
      } catch (e) { console.error(`Falha ao descriptografar complemento para encomenda ${row.nr_encomenda}:`, e); }

      // Etapa 2: Busca de endereço segura
      let addressDetails = null;
      if (decryptedCep) {
        addressDetails = await getAddressFromCep(decryptedCep);
      }

      // Etapa 3: Montagem segura do endereço final
      const addressParts: string[] = [];
      if (addressDetails) {
        if (addressDetails.logradouro) addressParts.push(addressDetails.logradouro);
        if (decryptedNumero) addressParts.push(`Nº ${decryptedNumero}`);
        if (decryptedComplemento) addressParts.push(decryptedComplemento);
        if (addressDetails.bairro) addressParts.push(addressDetails.bairro);
        if (addressDetails.localidade && addressDetails.uf) addressParts.push(`${addressDetails.localidade} - ${addressDetails.uf}`);
      
      // Fallback se a API de CEP falhar, mas tivermos os dados do banco
      } else if (decryptedCep || decryptedNumero) {
          if(decryptedCep) addressParts.push(`CEP: ${decryptedCep}`);
          if(decryptedNumero) addressParts.push(`Nº ${decryptedNumero}`);
          if(decryptedComplemento) addressParts.push(decryptedComplemento);
      }
      
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Endereço indisponível';
      
      // Etapa 4: Formatação de data segura
      let formattedTime = 'N/A';
      if (row.dt_entrega) {
        try {
            const deliveryDate = new Date(row.dt_entrega);
            // Verifica se a data é válida antes de formatar
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

    // Aguarda todas as promessas (buscas de CEP, etc.) serem resolvidas
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
}
