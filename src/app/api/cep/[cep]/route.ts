
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
 * API Route para consultar um CEP.
 * ATUALMENTE EM MODO DE TESTE: Retorna um endereço mocado.
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

  // =======================================================================
  // MODO DE TESTE: DADOS MOCADOS
  // =======================================================================
  const mockAddress = {
      cep: cep,
      logradouro: "Rua de Exemplo",
      complemento: "Lado A",
      bairro: "Bairro do Teste",
      localidade: "Cidade Fictícia",
      uf: "TS",
      ibge: "9999999",
      gia: "",
      ddd: "99",
      siafi: "9999"
  };

  return NextResponse.json({ success: true, data: mockAddress });

  /*
  // CÓDIGO ORIGINAL COM CHAMADA À API VIACEP (TEMPORARIAMENTE DESABILITADO)
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    
    if (!response.ok) {
      throw new Error(`Falha na API ViaCEP com status: ${response.status}`);
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      return NextResponse.json(
        { success: false, message: 'CEP não encontrado.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('[ERRO NA API DE CEP]:', error);
    return NextResponse.json(
      { success: false, message: 'Ocorreu um erro ao consultar o CEP.' },
      { status: 500 }
    );
  }
  */
}
