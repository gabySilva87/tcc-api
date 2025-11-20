'use client';

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, History } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

import { LogoutButton } from "@/components/logout-button";
import PendingTab from "@/components/dashboard/pending-tab";
import ProfileTab from "@/components/dashboard/profile-tab";
import HistoryTab from "@/components/dashboard/history-tab";
import type { Route } from "@/components/dashboard/pending-tab";

export default function DashboardPage() {
  const { toast } = useToast();
  const [driverName, setDriverName] = useState('');
  const [driverPhotoUrl, setDriverPhotoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isMounted, setIsMounted] = useState(false);

  const [pendingRoutes, setPendingRoutes] = useState<Route[]>([]);
  const [historyRoutes, setHistoryRoutes] = useState<Route[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    const driverId = sessionStorage.getItem('driverId');
    if (!driverId) {
        setError('ID do motorista não encontrado. Faça login novamente.');
        setLoading(false);
        return;
    }
    try {
        setLoading(true);
        const [routesRes, historyRes] = await Promise.all([
            fetch(`/api/routes?driverId=${driverId}`),
            fetch(`/api/history?driverId=${driverId}`)
        ]);

        if (!routesRes.ok) {
          const errorData = await routesRes.json();
          throw new Error(errorData.message || 'Falha ao carregar as rotas pendentes.');
        }
         if (!historyRes.ok) {
          const errorData = await historyRes.json();
          throw new Error(errorData.message || 'Falha ao carregar o histórico.');
        }

        const pendingData = await routesRes.json();
        const historyData = await historyRes.json();

        setPendingRoutes(pendingData);
        setHistoryRoutes(historyData);

    } catch (err: any) {
        setError(err.message);
        toast({ variant: 'destructive', title: 'Erro ao Carregar Dados', description: err.message });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const name = sessionStorage.getItem('driverName');
    const photoUrl = sessionStorage.getItem('driverPhotoUrl');
    if (name) setDriverName(name);
    if (photoUrl && photoUrl !== 'null') setDriverPhotoUrl(photoUrl);
    setIsMounted(true);
    
    fetchInitialData();
  }, [fetchInitialData]);
 // AQUI É O LUGAR CERTO PARA O CÓDIGO DE RASTREAMENTO
  useEffect(() => {
    const driverId = sessionStorage.getItem('driverId');
    let locationInterval: NodeJS.Timeout;

    if (driverId) {
        const sendLocation = () => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        await fetch(`/api/rastreamento`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ driverId, lat: latitude, lng: longitude }),
                        });
                    } catch (error) {
                        console.error('Falha ao enviar localização para a API interna:', error);
                    }
                },
                (error) => {
                    console.warn('Não foi possível obter a localização do GPS:', error.message);
                },
                { enableHighAccuracy: true } 
            );
        };
        
        sendLocation(); // Envia a primeira localização imediatamente
        locationInterval = setInterval(sendLocation, 15000); // E depois a cada 15 segundos
    }

    // Limpa o intervalo quando o usuário sai da página, para economizar bateria
    return () => {
        if (locationInterval) {
            clearInterval(locationInterval);
        }
    };
  }, []);

  const handleDeliverySuccess = useCallback((completedRoute: Route) => {
    setPendingRoutes(prev => prev.filter(r => r.id !== completedRoute.id));
    const successfulRoute = { ...completedRoute, status: 'entregue' as const };
    setHistoryRoutes(prev => [successfulRoute, ...prev]);
    setActiveTab('history');
  }, []);
  
  const handleDeliveryFailure = useCallback((failedRoute: Route) => {
    setPendingRoutes(prev => prev.filter(r => r.id !== failedRoute.id));
    const failedDelivery = { ...failedRoute, status: 'falha' as const };
    setHistoryRoutes(prev => [failedDelivery, ...prev]);
    setActiveTab('history');
  }, []);

 const handleRetry = useCallback(async (retriedRoute: Route) => {
    setHistoryRoutes(prev => prev.filter(r => r.id !== retriedRoute.id));
    
    try {
        const driverId = sessionStorage.getItem('driverId');
        const response = await fetch(`/api/encomendas/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              encomendaId: retriedRoute.encomendaId,
              roteiroId: retriedRoute.id, // Adicionado roteiroId que estava faltando
              status: 'Transito', 
              driverId 
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            setHistoryRoutes(prev => [retriedRoute, ...prev]); 
            throw new Error(errorData.message || 'Falha ao reiniciar a entrega.');
        }
        
        await fetchInitialData(); 

        toast({ title: 'Entrega Reiniciada', description: `A encomenda voltou para a lista de pendentes.` });
        setActiveTab('pending');

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro!', description: error.message });
    }
}, [toast, fetchInitialData]);

  const renderContent = () => {
    if (!isMounted || loading) {
      return (
        <div className="space-y-8 mt-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-8 w-3/4" />
            </div>
            <Skeleton className="h-12 w-full" />
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                <Skeleton className="h-[500px] w-full lg:col-span-1" />
                <Skeleton className="h-[500px] w-full lg:col-span-2 hidden md:block" />
            </div>
        </div>
      );
    }
    if (activeTab === 'profile') {
        return <ProfileTab driverName={driverName} driverPhotoUrl={driverPhotoUrl} onBack={() => setActiveTab('pending')} />;
    }

    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-3 space-y-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo, {driverName || 'Motorista'}!</h2>
            <p className="text-muted-foreground">Aqui estão suas atualizações mais recentes.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-auto">
              <TabsTrigger value="pending" className="py-2.5 text-sm"><Map className="w-4 h-4 mr-2"/>Em Trânsito</TabsTrigger>
              <TabsTrigger value="history" className="py-2.5 text-sm"><History className="w-4 h-4 mr-2"/>Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
              <PendingTab 
                  routes={pendingRoutes} 
                  loading={loading}
                  error={error}
                  onDeliverySuccess={handleDeliverySuccess}
                  onDeliveryFailure={handleDeliveryFailure}
                  setRoutes={setPendingRoutes}
              />
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <HistoryTab historyItems={historyRoutes} onRetry={handleRetry} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 relative">
           <Image src="/logo.png" alt="LogiDesk Logo" fill sizes="2.5rem" className="object-contain" />
              </div>
              <h1 className="text-xl font-bold text-foreground">LogiDesk</h1>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => setActiveTab('profile')} className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Avatar>
                  <AvatarImage src={driverPhotoUrl} alt={driverName} />
                  <AvatarFallback>{driverName ? driverName.charAt(0) : 'M'}</AvatarFallback>
                </Avatar>
               </button>
              <p className="text-sm font-medium text-foreground hidden sm:block truncate max-w-[150px]">{driverName}</p>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-1">
        {renderContent()}
      </main>
    </div>
  );
}
