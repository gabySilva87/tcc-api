
'use client';

// Importa os hooks do React para gerenciar estado e ciclo de vida.
import { useState, useEffect } from 'react';
// Importa componentes de UI da biblioteca ShadCN.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Componente para mostrar um placeholder de carregamento.
import { ScrollArea } from "@/components/ui/scroll-area"; // Componente para adicionar uma barra de rolagem.
import Image from 'next/image';

// Define a interface para o formato de uma rota, garantindo a tipagem dos dados.
interface Route {
  id: number;
  title: string;
  description: string;
  address: string;
  status: string;
  time: string;
}

// Componente para a aba de rotas/entregas.
export default function RoutesTab() {
  // Estados para gerenciar a lista de rotas, o estado de carregamento e possíveis erros.
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Estado para armazenar a rota que está selecionada na lista.
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // `useEffect` para buscar os dados das rotas da API quando o componente é montado.
  useEffect(() => {
    async function fetchRoutes() {
      try {
        // Faz a chamada `fetch` para a nossa API interna de rotas.
        const response = await fetch('/api/routes');
        const data = await response.json();
        
        // Se a resposta da API não foi bem-sucedida (ex: erro no servidor)...
        if (!response.ok) {
          // Lança um erro com a mensagem retornada pela API.
          throw new Error(data.message || 'Falha ao buscar os dados das rotas.');
        }
        setRoutes(data); // Atualiza o estado com as rotas recebidas.
        if (data.length > 0) {
            // Seleciona a primeira rota da lista por padrão para exibir os detalhes.
            setSelectedRoute(data[0]); 
        }
      } catch (err: any) {
        // Se ocorrer um erro durante o `fetch` ou na API, atualiza o estado de erro.
        setError(err.message);
      } finally {
        // Independentemente do resultado, define o carregamento como `false`.
        setLoading(false);
      }
    }

    fetchRoutes();
  }, []); // O array de dependências vazio `[]` garante que o efeito rode apenas uma vez.

  // Se os dados ainda estão sendo carregados, exibe um esqueleto de UI.
  if (loading) {
    return (
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1 flex flex-col">
                <Skeleton className="h-[500px] w-full" />
            </div>
            <div className="md:col-span-2">
                <Skeleton className="h-[500px] w-full" />
            </div>
        </div>
    );
  }

  // Se ocorreu um erro ao buscar os dados, exibe um cartão de alerta com a mensagem de erro.
  if (error) {
    return (
        <Card className="border-destructive/50">
            <CardHeader className="flex flex-row items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <CardTitle className="text-destructive">Erro de Conexão</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">{error}</p>
                <p className="text-muted-foreground text-sm mt-2">
                    Por favor, verifique se as credenciais no seu arquivo `.env.local` estão corretas e se o servidor de banco de dados está acessível.
                </p>
            </CardContent>
        </Card>
    );
  }

  // Se os dados foram carregados com sucesso, exibe a interface principal.
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* Coluna da esquerda: lista de entregas pendentes. */}
      <div className="md:col-span-1">
        <Card className="flex-1 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="w-6 h-6 text-primary" />
                    Entregas Pendentes
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                {routes.length > 0 ? (
                // Se houver rotas, exibe uma lista com barra de rolagem.
                <ScrollArea className="h-[400px]">
                    <ul className="space-y-0">
                    {routes.map((route, index) => (
                        // Cada item da lista é clicável e atualiza a rota selecionada.
                        <li key={route.id} onClick={() => setSelectedRoute(route)} className={`cursor-pointer p-4 hover:bg-muted/50 ${selectedRoute?.id === route.id ? 'bg-muted' : ''}`}>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                <p className="font-semibold">{route.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{route.address}</p>
                                <p className="text-xs text-muted-foreground/80 mt-1">{route.time}</p>
                                </div>
                                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                            </div>
                            {/* Adiciona um separador entre os itens, exceto no último. */}
                            {index < routes.length - 1 && <Separator className="mt-4" />}
                        </li>
                    ))}
                    </ul>
                </ScrollArea>
                ) : (
                // Se não houver rotas, exibe uma mensagem.
                <div className="p-4 text-center text-muted-foreground">
                    <p>Nenhuma entrega pendente no momento.</p>
                </div>
                )}
            </CardContent>
        </Card>
      </div>
      
      {/* Coluna da direita: detalhes da rota selecionada. */}
      <div className="md:col-span-2">
        {selectedRoute ? (
            // Se uma rota estiver selecionada, exibe seus detalhes.
            <Card>
                <CardHeader>
                    <CardTitle>{selectedRoute.title}</CardTitle>
                    <CardContent className="p-0 pt-2">
                        <p className="text-muted-foreground">{selectedRoute.description}</p>
                    </CardContent>
                </CardHeader>
                <CardContent>
                {/* Imagem de placeholder para o mapa. */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <Image src="https://picsum.photos/seed/map/400/225" width={400} height={225} alt="Map of next delivery" className="object-cover w-full h-full" data-ai-hint="city map" />
                </div>
                {/* Informações detalhadas da rota. */}
                <div className="mt-4 space-y-3">
                    <p className="flex justify-between items-center text-sm"><strong>Horário Previsto:</strong> <span>{selectedRoute.time}</span></p>
                    <p className="flex justify-between items-center text-sm"><strong>Endereço:</strong> <span>{selectedRoute.address}</span></p>
                    <div className="flex justify-between items-center text-sm"><strong>Status:</strong> <Badge variant="success">{selectedRoute.status}</Badge></div>
                </div>
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">Iniciar Rota</Button>
                </CardContent>
            </Card>
        ) : (
            // Se nenhuma rota estiver selecionada (ou se a lista estiver vazia), exibe uma mensagem.
            <Card className="flex items-center justify-center h-full">
                <CardContent>
                    <p className="text-muted-foreground">Selecione uma rota para ver os detalhes.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
