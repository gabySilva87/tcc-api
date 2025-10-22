import { NextResponse, NextRequest } from 'next/server';

/**
 * API Route para atualizar o status de uma encomenda.
 * ATUALMENTE EM MODO DE TESTE: Simula sucesso sem alterar o banco de dados.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { status, photo } = body;

  console.log(`[API MOCK] Recebido pedido para atualizar encomenda ${id}`);
  console.log(`[API MOCK] Novo status: ${status}`);
  console.log(`[API MOCK] Foto recebida: ${photo ? 'Sim' : 'Não'} (${photo ? Math.round(photo.length / 1024) + ' KB' : ''})`);

  // Validação básica
  if (!id || !status) {
    return NextResponse.json(
      { success: false, message: 'ID da encomenda e status são obrigatórios.' },
      { status: 400 }
    );
  }

  if (status === 'entregue' && !photo) {
     return NextResponse.json(
      { success: false, message: 'Uma foto é obrigatória para marcar como entregue.' },
      { status: 400 }
    );
  }

  // Simula um pequeno atraso de rede
  await new Promise(resolve => setTimeout(resolve, 1500));

  // No futuro, aqui você faria a lógica de banco de dados:
  // 1. Iniciar uma transação.
  // 2. Salvar a imagem em um serviço de armazenamento (como Firebase Storage ou AWS S3).
  // 3. Obter a URL da imagem salva.
  // 4. Atualizar a tabela `encomenda` com o novo `id_status_encomenda`.
  // 5. Inserir um novo registro na `historico_status_encomenda` com o novo status e a URL da foto.
  // 6. Finalizar a transação.
  
  // Por enquanto, apenas retornamos sucesso.
  return NextResponse.json({
    success: true,
    message: `Encomenda #${id} atualizada para '${status}' com sucesso (simulado).`,
  });
}
