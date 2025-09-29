
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
    const result: CepApiResponse = await response.json();

    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error(`Falha ao buscar CEP ${cep}:`, error);
    return null;
  }
}


// A função GET é uma API Route que é acionada quando o frontend faz uma requisição
// do tipo GET para `/api/routes`.
export async function GET(request: NextRequest) {
  // Extrai os parâmetros da URL, especificamente o `driverId`.
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId');
  
  // Se o `driverId` não for fornecido, retorna um erro, pois é necessário para filtrar as encomendas.
  if (!driverId) {
    return NextResponse.json({ message: 'O ID do motorista é obrigatório.' }, { status: 400 });
  }

  let connection;
  try {
    // =======================================================================
    // PASSO 1: CONEXÃO COM O BANCO DE DADOS MYSQL
    // =======================================================================
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    // =======================================================================
    // PASSO 2: CONSULTA SQL PARA BUSCAR DADOS
    // =======================================================================
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
       LEFT JOIN tb_endereco AS end ON e.cd_endereco = end.id_endereco
       WHERE r.id_motorista = ?`,
       [driverId]
    );

    // =======================================================================
    // PASSO 3: MAPEAMENTO E DESCRIPTOGRAFIA DOS DADOS
    // =======================================================================
    const routesPromises = (rows as any[]).map(async (row) => {
      try {
        const decryptedCep = row.nr_cep ? decrypt(row.nr_cep) : null;
        const decryptedNumero = row.nr_casa ? decrypt(row.nr_casa) : '';
        const decryptedComplemento = row.ds_complemento ? decrypt(row.ds_complemento) : '';
        
        let addressDetails = null;
        if (decryptedCep) {
          addressDetails = await getAddressFromCep(decryptedCep);
        }

        let fullAddress = 'Endereço indisponível';
        if (addressDetails) {
            // Constrói o endereço completo com os dados da API ViaCEP
            const addressParts = [
                addressDetails.logradouro, // Rua
                decryptedNumero ? `Nº ${decryptedNumero}` : null,
                decryptedComplemento,
                addressDetails.bairro,
                `${addressDetails.localidade} - ${addressDetails.uf}`
            ];
            fullAddress = addressParts.filter(Boolean).join(', ');
        } else if (decryptedCep) {
            // Fallback se a API de CEP falhar: mostra o que temos
            const addressParts = [
                `CEP: ${decryptedCep}`,
                decryptedNumero ? `Nº ${decryptedNumero}` : null,
                decryptedComplemento,
            ];
            fullAddress = addressParts.filter(Boolean).join(', ');
        }

        // Formata a data de entrega
        let formattedTime = 'Não definido';
        if (row.dt_entrega) {
          const deliveryDate = new Date(row.dt_entrega);
          if (!isNaN(deliveryDate.getTime())) {
            formattedTime = deliveryDate.toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }).replace(',', '');
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
      } catch (e) {
        console.error(`Falha ao processar dados para a encomenda #${row.nr_encomenda}:`, e);
        return {
          id: row.id_encomenda,
          title: `Encomenda #${row.nr_encomenda}`,
          description: `Cliente: ${row.nm_cliente}`,
          address: 'Erro ao processar endereço',
          status: 'pendente',
          time: 'N/A',
          read: false
        };
      }
    });

    // Aguarda todas as promessas serem resolvidas
    const routes = await Promise.all(routesPromises);
    
    // =======================================================================
    // PASSO 4: RETORNAR OS DADOS FORMATADOS
    // =======================================================================
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

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  } finally {
    // =======================================================================
    // PASSO 5: FECHAR A CONEXÃO
    // =======================================================================
    if (connection) {
      await connection.end();
    }
  }
}
