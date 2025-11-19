'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Truck, RefreshCw, PackageCheck, AlertCircle, Package, Route as RouteIcon } from "lucide-react";
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
      const updatedRoutes = routes.map(r => r.id === route.id ? { ...r, status: 'Em trânsito' } : r);
      setRoutes(updatedRoutes);
      setSelectedRoute({ ...route, status:'Em trânsito' });
      toast({ title: "Rota Iniciada!", description: "O status da encomenda foi atualizado para Em trânsito." });

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
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1"><Skeleton className="h-[300px] md:h-[400px] w-full" /></div>
        <div className="lg:col-span-2 hidden lg:block"><Skeleton className="h-[400px] w-full" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardHeader className="flex items-center gap-3 pb-2">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <CardTitle className="text-destructive">Erro de Conexão</CardTitle>
        </CardHeader>
        <CardContent><p className="text-destructive/90">{error}</p></CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Lista de Entregas */}
        <div className="lg:col-span-1 col-span-1">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="w-6 h-6 text-primary" />Entregas Pendentes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              {routes.length > 0 ? (
                <ScrollArea className="max-h-[50vh] md:max-h-[400px] overflow-auto">
                  <ul className="space-y-0">
                    {routes.map((route, index) => (
                      <li key={`${route.id}-${index}`} onClick={() => setSelectedRoute(route)}
                          className={`cursor-pointer p-4 hover:bg-muted/50 transition-colors ${selectedRoute?.id === route.id ? 'bg-muted' : ''}`}>
                        <div className="flex gap-4 items-start">
                          <div className="flex-1">
                            <p className="font-semibold break-words">{route.clientName}</p>
                            <p className="text-sm text-muted-foreground font-medium break-words">{route.productName}</p>
                            <p className="text-sm text-muted-foreground break-words">{route.address}</p>
                          </div>
                          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                        {index < routes.length - 1 && <Separator className="mt-4" />}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <div className="p-6 text-center text-muted-foreground h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center gap-4 border-dashed border-2 rounded-lg m-4">
                  <PackageCheck className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
                  <p className="font-medium text-lg">Nenhuma entrega pendente!</p>
                  <p className="text-sm">Você está em dia. Bom trabalho!</p>
                  <Button variant="outline" onClick={fetchRoutes} className="mt-4 flex items-center justify-center w-full md:w-auto">
                    <RefreshCw className="w-4 h-4 mr-2" />Verificar novamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes da Entrega */}
        <div className="lg:col-span-2 col-span-1">
          {selectedRoute ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{selectedRoute.clientName}</CardTitle>
                <p className="text-sm text-muted-foreground">Nº da Encomenda: {selectedRoute.title}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                    <strong className="text-muted-foreground flex items-center gap-2"><Package className="w-4 h-4"/>Produto:</strong>
                    <span className="text-right font-medium break-words">{selectedRoute.productName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                    <strong className="text-muted-foreground">Endereço:</strong>
                    <span className="text-right font-medium break-words">{selectedRoute.address}</span>
                  </div>
                </div>
                
                <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                  {selectedRoute.status === 'Transito' ? (
                    <Button onClick={() => handleStartRoute(selectedRoute)} className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center" disabled={isUpdating}>
                      <RouteIcon className="w-5 h-5 mr-2" />
                      {isUpdating ? 'Iniciando...' : 'Iniciar Rota'}
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => setIsModalOpen(true)} className="w-full text-lg py-6 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center" disabled={isUpdating}>
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Reportar Problema
                      </Button>
                      <Button onClick={() => handleMarkAsDelivered(selectedRoute)} className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center" disabled={isUpdating}>
                        {isUpdating ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <PackageCheck className="w-5 h-5 mr-2" />}
                        {isUpdating ? 'Atualizando...' : 'Marcar como Entregue'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            routes.length > 0 && (
              <Card className="flex items-center justify-center h-full min-h-[300px] md:min-h-[400px] bg-muted/30 border-dashed">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Selecione uma entrega</h3>
                  <p>Clique em um item da lista para ver os detalhes aqui.</p>
                </div>
              </Card>
            )
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
