
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Truck, RefreshCw, PackageCheck, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { ReportProblemModal } from './report-problem-modal';

// A interface da rota não muda
export interface Route {
  id: string | number;
  title: string;
  description: string;
  address: string;
  status: 'pendente' | 'entregue' | 'Nentregue' | 'transito';
  time: string;
  clientName: string;
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

  const handleUpdateStatus = async (routeId: string | number, status: 'Entregue') => {
    setIsUpdating(true);
    const driverId = sessionStorage.getItem('driverId');
    try {
      const response = await fetch(`/api/encomendas/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encomendaId: routeId, status, driverId }),
      });
      if (!response.ok) throw new Error('Falha ao marcar como entregue.');

      const updatedRoute = routes.find(r => r.id === routeId);
      if (updatedRoute) onDeliverySuccess(updatedRoute);

      toast({ title: "Sucesso!", description: "Encomenda marcada como entregue." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro na Ação", description: err.message });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleOpenModal = () => {
    if (selectedRoute) setIsModalOpen(true);
  };

  const handleReportConfirm = () => {
    if (selectedRoute) {
      onDeliveryFailure(selectedRoute); 
    }
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
        {/* Coluna da Lista de Entregas */}
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

        {/* Coluna de Detalhes da Entrega - COM A SINTAXE CORRIGIDA */}
        <div className="lg:col-span-2">
          {selectedRoute ? (
            <Card>
              <CardHeader>
                  <CardTitle>{selectedRoute.clientName}</CardTitle>
                  <p className="text-sm text-muted-foreground">ID da Entrega: #{String(selectedRoute.id)}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                    <strong className="text-muted-foreground">Endereço:</strong>
                    <span className="text-right font-medium">{selectedRoute.address}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button onClick={handleOpenModal} className="w-full text-lg py-6 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center" disabled={isUpdating}>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Reportar Problema
                  </Button>
                  <Button onClick={() => handleUpdateStatus(selectedRoute.id, 'Entregue')} className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center" disabled={isUpdating}>
                    {isUpdating ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <PackageCheck className="w-5 h-5 mr-2" />}
                    {isUpdating ? 'Atualizando...' : 'Marcar como Entregue'}
                  </Button>
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
      
      <ReportProblemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        route={selectedRoute}
        onSuccess={handleReportConfirm} 
      />
    </>
  );
}
