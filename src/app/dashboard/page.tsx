'use client';

// Importa os hooks do React para gerenciar estado e ciclo de vida.
import { useState, useEffect } from "react";
// Importa componentes de UI da biblioteca ShadCN.
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
// Importa ícones da biblioteca lucide-react.
import { Map, CheckCheck, BookClock } from "lucide-react";
// Importa o componente de imagem otimizada do Next.js.
import Image from "next/image";

// Importa componentes customizados da aplicação.
import { LogoutButton } from "@/components/logout-button";
import PendingTab from "@/components/dashboard/pending-tab";
import DeliveredTab from "@/components/dashboard/delivered-tab";
import ProfileTab from "@/components/dashboard/profile-tab";
import HistoryTab from "@/components/dashboard/history-tab";
import type { Route } from "@/components/dashboard/pending-tab";

// Componente principal da página da dashboard.
export default function DashboardPage() {
  // Define estados para armazenar os dados do motorista.
  const [driverName, setDriverName] = useState('');
  const [driverPhotoUrl, setDriverPhotoUrl] = useState('');
  // Define o estado da aba ativa. 'pending' é o valor inicial.
  const [activeTab, setActiveTab] = useState('pending');
  // Estado para verificar se o componente já foi montado no cliente.
  const [isMounted, setIsMounted] = useState(false);

  // Estados para gerenciar as listas de entregas
  const [pendingRoutes, setPendingRoutes] = useState<Route[]>([]);
  const [deliveredRoutes, setDeliveredRoutes] = useState<Route[]>([]);
  const [historyRoutes, setHistoryRoutes] = useState<Route[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `useEffect` para executar código do lado do cliente após a montagem inicial.
  useEffect(() => {
    // Busca os dados do motorista que foram salvos no `sessionStorage`.
    const name = sessionStorage.getItem('driverName');
    const photoUrl = sessionStorage.getItem('driverPhotoUrl');
    if (name) {
      setDriverName(name);
    }
    if (photoUrl) {
      setDriverPhotoUrl(photoUrl);
    }
    // Define que o componente foi montado. Isso evita erros de hidratação.
    setIsMounted(true);
    
    // Busca as rotas pendentes
    const fetchInitialRoutes = async () => {
        const driverId = sessionStorage.getItem('driverId');
        if (!driverId) {
            setError('ID do motorista não encontrado.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`/api/routes?driverId=${driverId}`);
            if (!response.ok) throw new Error('Falha ao carregar rotas.');
            const data = await response.json();
            setPendingRoutes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchInitialRoutes();

  }, []);

  const handleDeliverySuccess = (completedRoute: Route) => {
    setPendingRoutes(prev => prev.filter(r => r.id !== completedRoute.id));
    
    const successfulRoute = { ...completedRoute, status: 'entregue' };
    setDeliveredRoutes(prev => [successfulRoute, ...prev]);
    setHistoryRoutes(prev => [successfulRoute, ...prev]);
  };
  
  const handleDeliveryFailure = (failedRoute: Route) => {
    // No futuro, podemos adicionar lógica para lidar com falhas
  };


  const renderContent = () => {
    // Se o componente ainda não foi montado, exibe um esqueleto de UI para evitar erro de hidratação.
    if (!isMounted || loading) {
      return (
        <div className="space-y-8">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[500px] w-full" />
        </div>
      );
    }

    // Se a aba de perfil está ativa, renderiza o componente do perfil.
    if (activeTab === 'profile') {
        return <ProfileTab driverName={driverName} driverPhotoUrl={driverPhotoUrl} onBack={() => setActiveTab('pending')} />;
    }

    // Caso contrário, renderiza a visualização principal com as abas.
    return (
      <>
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo, {driverName || 'Motorista'}!</h2>
          <p className="text-muted-foreground">Aqui estão suas atualizações mais recentes.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-auto">
            <TabsTrigger value="pending" className="py-2.5 text-sm">
              <Map className="w-4 h-4 mr-2"/>
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="delivered" className="py-2.5 text-sm">
              <CheckCheck className="w-4 h-4 mr-2"/>
              Entregues
            </TabsTrigger>
             <TabsTrigger value="history" className="py-2.5 text-sm">
              <BookClock className="w-4 h-4 mr-2"/>
              Histórico
            </TabsTrigger>
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
          <TabsContent value="delivered" className="mt-6">
            <DeliveredTab deliveredRoutes={deliveredRoutes} />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <HistoryTab historyItems={historyRoutes} />
          </TabsContent>
        </Tabs>
      </>
    );
  }

  // =======================================================================
  // INÍCIO DO JSX DO COMPONENTE
  // =======================================================================
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      {/* Cabeçalho fixo da página. */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 relative">
                <Image
                  src="/LogiDesk.Logo.png"
                  alt="LogiDesk Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-foreground">LogiDesk</h1>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => setActiveTab('profile')} className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Avatar>
                  <AvatarImage src={driverPhotoUrl} alt={driverName} data-ai-hint="driver portrait" />
                  <AvatarFallback>{driverName ? driverName.charAt(0) : 'M'}</AvatarFallback>
                </Avatar>
               </button>
              <p className="text-sm font-medium text-foreground hidden sm:block truncate max-w-[150px]">{driverName}</p>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal da página. */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-1">
        {renderContent()}
      </main>
    </div>
  );
}
