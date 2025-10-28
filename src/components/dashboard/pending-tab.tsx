'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Truck, RefreshCw, PackageCheck, AlertCircle, Package, Route as RouteIcon } from "lucide-react"; // Ícone de Rota adicionado
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { ReportProblemModal } from './report-problem-modal';

export interface Route {
  id: number; 
  encomendaId: number; 
  title: string;
  productName: string; 
  address: string;
  status: string;
  clientName: string;
  deliveryDate?: string;
}

interface PendingTabProps {
    routes: Route[];
    loading: boolean;
    error: string | null;
    onDeliverySuccess: (route: Route) => void;
    onDeliveryFailure: (route: Route) => void; 
    setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
}

export default function PendingTab({ routes, loading, error, onDeliverySuccess, onDeliveryFailure, setRoutes }: PendingTabProps) {
  const { toast } = useToast();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (routes.length > 0 && (!selectedRoute || !routes.some(r => r.id === selectedRoute.id))) {
      setSelectedRoute(routes[0]);
    } else if (routes.length === 0) {
      setSelectedRoute(null);
    }
  }, [routes, selectedRoute]);

  const fetchRoutes = useCallback(async () => {
    const driverId = sessionStorage.getItem('driverId');
    if (!driverId) return;
    try {
      const response = await fetch(`/api/routes?driverId=${driverId}`);
      if (!response.ok) throw new Error('Falha ao recarregar rotas');
      const data = await response.json();
      setRoutes(data);
    } catch (err) {
       toast({ variant: "destructive", title: "Erro ao Recarregar", description: (err as Error).message });
    }
  }, [setRoutes, toast]);

  // Função genérica para atualizar o status
  const updateDeliveryStatus = async (route: Route, status: string) => {
    setIsUpdating(true);
    const driverId = sessionStorage.getItem('driverId');
    try {
      const response = await fetch(`/api/encomendas/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roteiroId: route.id, encomendaId: route.encomendaId, status, driverId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Falha ao atualizar para ${status}.`);
      }
      return true;
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro na Ação", description: err.message });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartRoute = async (route: Route) => {
    const success = await updateDeliveryStatus(route, 'Transito');
    if (success) {
      // Atualiza o estado local para refletir a mudança imediatamente
      const updatedRoutes = routes.map(r => r.id === route.id ? { ...r, status: 'Em trânsito' } : r);
      setRoutes(updatedRoutes);
      setSelectedRoute({ ...route, status:'Em trânsito' }); // Garante que a rota selecionada também seja atualizada
      toast({ title: "Rota Iniciada!", description: "O status da encomenda foi atualizado para Em trânsito." });
      
      // Abre o Google Maps em uma nova aba
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(route.address)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const handleMarkAsDelivered = async (route: Route) => {
    const success = await updateDeliveryStatus(route, 'Entregue');
    if (success) {
      onDeliverySuccess(route);
      toast({ title: "Sucesso!", description: "Encomenda marcada como entregue." });
    }
  };
  
  const handleProblemReportSuccess = () => {
    if (!selectedRoute) return;
    onDeliveryFailure(selectedRoute);
  };

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1"><Skeleton className="h-[500px] w-full" /></div>
        <div className="lg:col-span-2 hidden md:block"><Skeleton className="h-[500px] w-full" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <CardTitle className="text-destructive">Erro de Conexão</CardTitle>
        </CardHeader>
        <CardContent><p className="text-destructive/90">{error}</p></CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck className="w-6 h-6 text-primary" />Entregas Pendentes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              {routes.length > 0 ? (
                <ScrollArea className="h-[calc(100vh-22rem)] md:h-[400px]">
                  <ul className="space-y-0">
                    {routes.map((route, index) => (
                      <li key={route.id} onClick={() => setSelectedRoute(route)} className={`cursor-pointer p-4 hover:bg-muted/50 transition-colors ${selectedRoute?.id === route.id ? 'bg-muted' : ''}`}>
                        <div className="flex gap-4 items-start">
                          <div className="flex-1">
                            <p className="font-semibold">{route.clientName}</p>
                            <p className="text-sm text-muted-foreground font-medium">{route.productName}</p>
                            <p className="text-sm text-muted-foreground truncate">{route.address}</p>
                          </div>
                          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                        {index < routes.length - 1 && <Separator className="mt-4" />}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <div className="p-6 text-center text-muted-foreground h-full min-h-[300px] flex flex-col items-center justify-center gap-4 border-dashed border-2 rounded-lg m-4">
                    <PackageCheck className="w-12 h-12 text-green-500" />
                    <p className="font-medium text-lg">Nenhuma entrega pendente!</p>
                    <p className="text-sm">Você está em dia. Bom trabalho!</p>
                    <Button variant="outline" onClick={fetchRoutes} className="mt-4"><RefreshCw className="w-4 h-4 mr-2" />Verificar novamente</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedRoute ? (
            <Card>
                <CardHeader>
                    <CardTitle>{selectedRoute.clientName}</CardTitle>
                    <p className="text-sm text-muted-foreground">Nº da Encomenda: {selectedRoute.title}</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                            <strong className="text-muted-foreground flex items-center gap-2"><Package className="w-4 h-4"/>Produto:</strong>
                            <span className="text-right font-medium">{selectedRoute.productName}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                            <strong className="text-muted-foreground">Endereço:</strong>
                            <span className="text-right font-medium">{selectedRoute.address}</span>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        {selectedRoute.status === 'Transito' ? (
                            // CORREÇÃO: Cor do botão alterada para a cor primária do tema.
                            <Button onClick={() => handleStartRoute(selectedRoute)} className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center" disabled={isUpdating}>
                                <RouteIcon className="w-5 h-5 mr-2" />
                                {isUpdating ? 'Iniciando...' : 'Iniciar Rota'}
                            </Button>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button onClick={() => setIsModalOpen(true)} className="w-full text-lg py-6 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center" disabled={isUpdating}>
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Reportar Problema
                                </Button>
                                 {/* CORREÇÃO: Cor do botão alterada para a cor primária do tema para consistência. */}
                                <Button onClick={() => handleMarkAsDelivered(selectedRoute)} className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center" disabled={isUpdating}>
                                    {isUpdating ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <PackageCheck className="w-5 h-5 mr-2" />}
                                    {isUpdating ? 'Atualizando...' : 'Marcar como Entregue'}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
          ) : (
            routes.length > 0 ? (
                <Card className="hidden lg:flex items-center justify-center h-full min-h-[400px] bg-muted/30 border-dashed">
                    <div className="text-center text-muted-foreground">
                        <MapPin className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">Selecione uma entrega</h3>
                        <p>Clique em um item da lista para ver os detalhes aqui.</p>
                    </div>
                </Card>
            ) : null
          )}
        </div>
      </div>
      
      {selectedRoute && (
        <ReportProblemModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          route={selectedRoute}
          onSuccess={handleProblemReportSuccess}
        />
      )}
    </>
  );
}
