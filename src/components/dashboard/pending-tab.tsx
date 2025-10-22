'use client';

// Importa os hooks do React para gerenciar estado e ciclo de vida.
import { useState, useEffect, useCallback } from 'react';
// Importa componentes de UI da biblioteca ShadCN.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Truck, RefreshCw, PackageCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Componente para mostrar um placeholder de carregamento.
import { ScrollArea } from "@/components/ui/scroll-area"; // Componente para adicionar uma barra de rolagem.
import Image from 'next/image';
import DeliveryModal from './delivery-modal'; // Importa o novo modal

// Define a interface para o formato de uma rota, garantindo a tipagem dos dados.
export interface Route {
  id: string | number;
  title: string;
  description: string;
  address: string;
  status: 'pendente' | 'entregue' | 'falha';
  time: string;
}

interface PendingTabProps {
    routes: Route[];
    loading: boolean;
    error: string | null;
    onDeliverySuccess: (route: Route) => void;
    onDeliveryFailure: (route: Route) => void;
    setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
}

// Componente para a aba de rotas/entregas.
export default function PendingTab({ routes, loading, error, onDeliverySuccess, setRoutes }: PendingTabProps) {
  // Estado para armazenar a rota que está selecionada na lista.
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  // Estado para controlar a visibilidade do modal de entrega
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Efeito para selecionar a primeira rota quando a lista é carregada
  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0]);
    }
    if (routes.length === 0) {
      setSelectedRoute(null);
    }
  }, [routes, selectedRoute]);


  const handleSuccess = (deliveryId: string | number) => {
    const completedRoute = routes.find(r => r.id === deliveryId);
    if(completedRoute) {
        onDeliverySuccess(completedRoute);
    }
    setIsModalOpen(false);
    // Seleciona a próxima rota da lista ou limpa a seleção
    const currentIndex = routes.findIndex(r => r.id === deliveryId);
    if (routes.length > 1) {
        setSelectedRoute(routes[currentIndex + 1] || routes[0]);
    } else {
        setSelectedRoute(null);
    }
  };
  
  const fetchRoutes = useCallback(async () => {
    const driverId = sessionStorage.getItem('driverId');
    if (!driverId) {
      return;
    }
    try {
      const response = await fetch(`/api/routes?driverId=${driverId}`);
      if (!response.ok) throw new Error('Falha ao recarregar rotas');
      const data = await response.json();
      setRoutes(data);
    } catch (err) {
      // O erro é gerenciado no componente pai
    }
  }, [setRoutes]);


  // Se os dados ainda estão sendo carregados, exibe um esqueleto de UI.
  if (loading) {
    return (
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-1 flex flex-col">
                <Skeleton className="h-[500px] w-full" />
            </div>
            <div className="lg:col-span-2 hidden md:block">
                <Skeleton className="h-[500px] w-full" />
            </div>
        </div>
    );
  }

  // Se ocorreu um erro ao buscar os dados, exibe um cartão de alerta com a mensagem de erro.
  if (error) {
    return (
        <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <CardTitle className="text-destructive">Erro de Conexão</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive/90">{error}</p>
                <p className="text-muted-foreground text-sm mt-2">
                    Não foi possível carregar os dados das entregas. Verifique a API ou tente novamente.
                </p>
            </CardContent>
        </Card>
    );
  }

  // Se os dados foram carregados com sucesso, exibe a interface principal.
  return (
    <>
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        {/* Coluna da esquerda: lista de entregas pendentes. */}
        <div className="lg:col-span-1">
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
                  <ScrollArea className="h-[calc(100vh-22rem)] md:h-[400px]">
                      <ul className="space-y-0">
                      {routes.map((route, index) => (
                          // Cada item da lista é clicável e atualiza a rota selecionada.
                          <li key={route.id} onClick={() => setSelectedRoute(route)} className={`cursor-pointer p-4 hover:bg-muted/50 transition-colors ${selectedRoute?.id === route.id ? 'bg-muted' : ''}`}>
                              <div className="flex gap-4 items-start">
                                  <div className="flex-1">
                                  <p className="font-semibold">{route.title}</p>
                                  <p className="text-sm text-muted-foreground truncate">{route.description}</p>
                                  <div className="flex items-center justify-between mt-2">
                                      <Badge variant={route.status === 'pendente' ? 'secondary' : 'success'}>{route.status}</Badge>
                                      <p className="text-xs text-muted-foreground/80">{route.time}</p>
                                  </div>
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
                  // Se não houver rotas, exibe uma mensagem amigável.
                  <div className="p-6 text-center text-muted-foreground h-full min-h-[300px] flex flex-col items-center justify-center gap-4 border-dashed border-2 rounded-lg m-4">
                      <PackageCheck className="w-12 h-12 text-green-500" />
                      <p className="font-medium text-lg">Nenhuma entrega pendente!</p>
                      <p className="text-sm">Você está em dia. Bom trabalho!</p>
                      <Button variant="outline" onClick={fetchRoutes} className="mt-4">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Verificar novamente
                      </Button>
                  </div>
                  )}
              </CardContent>
          </Card>
        </div>
        
        {/* Coluna da direita: detalhes da rota selecionada. */}
        <div className="lg:col-span-2">
          {selectedRoute ? (
              // Se uma rota estiver selecionada, exibe seus detalhes.
              <Card>
                  <CardHeader>
                      <CardTitle>{selectedRoute.title}</CardTitle>
                      <CardDescription>{selectedRoute.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                  {/* Imagem de placeholder para o mapa. */}
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-4">
                      <Image src="https://picsum.photos/seed/map/800/450" width={800} height={450} alt="Map of next delivery" className="object-cover w-full h-full" data-ai-hint="city map" />
                  </div>
                  {/* Informações detalhadas da rota. */}
                  <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                          <strong className="text-muted-foreground">Endereço:</strong>
                          <span className="text-right font-medium">{selectedRoute.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                          <strong className="text-muted-foreground">Horário Previsto:</strong>
                          <span className="font-medium">{selectedRoute.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                          <strong className="text-muted-foreground">Status:</strong>
                          <Badge variant={selectedRoute.status === 'pendente' ? 'secondary' : 'success'}>{selectedRoute.status}</Badge>
                      </div>
                  </div>
                  <Button onClick={() => setIsModalOpen(true)} className="w-full mt-6 text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground">Iniciar Rota</Button>
                  </CardContent>
              </Card>
          ) : (
            routes.length > 0 && (
              <Card className="hidden lg:flex items-center justify-center h-full min-h-[400px] bg-muted/30 border-dashed">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Selecione uma entrega</h3>
                  <p>Clique em um item da lista para ver os detalhes aqui.</p>
                </div>
              </Card>
            )
          )}
        </div>
      </div>
      {selectedRoute && (
        <DeliveryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          route={selectedRoute}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
