
import { NextResponse } from 'next/server';

// Interface para definir o formato de uma rota de exemplo.
interface MockRoute {
  id: number;
  title: string;
  description: string;
  address: string;
  status: string;
  time: string;
  read: boolean;
}

// A função GET agora retorna dados de exemplo (mock data) em vez de conectar ao banco.
export async function GET(request: Request) {
  // Lista de entregas de exemplo.
  const mockRoutes: MockRoute[] = [
    {
      id: 1,
      title: "Encomenda #1023",
      description: "Cliente: Ana Silva",
      address: "Rua das Flores, 123, Bairro Jardim, São Paulo, SP",
      status: "pendente",
      time: "10:30",
      read: false
    },
    {
      id: 2,
      title: "Encomenda #1024",
      description: "Cliente: Bruno Costa",
      address: "Avenida Principal, 456, Centro, Rio de Janeiro, RJ",
      status: "pendente",
      time: "11:15",
      read: false
    },
    {
      id: 3,
      title: "Encomenda #1025",
      description: "Cliente: Carlos Souza",
      address: "Praça da Matriz, 789, Vila Nova, Belo Horizonte, MG",
      status: "pendente",
      time: "14:00",
      read: false
    }
  ];

  try {
    // Simula um pequeno atraso de rede para parecer mais realista.
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retorna a lista de dados de exemplo como uma resposta JSON.
    return NextResponse.json(mockRoutes);

  } catch (error) {
    // Bloco de erro mantido para qualquer eventualidade, mas é improvável que seja usado agora.
    console.error('[ERRO NA API DE ROTAS MOCK]:', error);
    return NextResponse.json(
      { message: 'Ocorreu um erro ao gerar os dados de exemplo.' },
      { status: 500 }
    );
  }
}
