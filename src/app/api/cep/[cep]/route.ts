
import { NextResponse } from 'next/server';

// Interface para definir a estrutura da resposta da API ViaCEP.
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * API Route para consultar um CEP usando a API externa ViaCEP.
 * @param _request - O objeto de requisição (não utilizado).
 * @param params - Os parâmetros da URL, contendo o CEP a ser consultado.
 * @returns Uma resposta JSON com os dados do endereço ou uma mensagem de erro.
 */
export async function GET(
  _request: Request,
  { params }: { params: { cep: string } }
) {
  const { cep } = params;

  // Validação simples do CEP.
  if (!cep || !/^\d{8}$/.test(cep)) {
    return NextResponse.json(
      { success: false, message: 'CEP inválido. Forneça um CEP com 8 dígitos.' },
      { status: 400 }
    );
  }

  try {
    // Faz a chamada fetch para a API ViaCEP.
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    
    // Se a resposta da API externa não for bem-sucedida, lança um erro.
    if (!response.ok) {
      throw new Error(`Falha na API ViaCEP com status: ${response.status}`);
    }

    const data: ViaCepResponse = await response.json();

    // A API ViaCEP retorna um objeto com `erro: true` se o CEP não for encontrado.
    if (data.erro) {
      return NextResponse.json(
        { success: false, message: 'CEP não encontrado.' },
        { status: 404 }
      );
    }
    
    // Retorna os dados do endereço com sucesso.
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('[ERRO NA API DE CEP]:', error);
    return NextResponse.json(
      { success: false, message: 'Ocorreu um erro ao consultar o CEP.' },
      { status: 500 }
    );
  }
}
