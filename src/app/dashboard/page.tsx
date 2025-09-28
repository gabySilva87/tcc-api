
'use client';

// Importa os hooks do React para gerenciar estado e ciclo de vida.
import { useState, useEffect } from "react";
// Importa componentes de UI da biblioteca ShadCN.
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Importa ícones da biblioteca lucide-react.
import { Map, CheckCheck } from "lucide-react";
// Importa o componente de imagem otimizada do Next.js.
import Image from "next/image";

// Importa componentes customizados da aplicação.
import { LogoutButton } from "@/components/logout-button";
import PendingTab from "@/components/dashboard/pending-tab";
import DeliveredTab from "@/components/dashboard/delivered-tab";
import ProfileTab from "@/components/dashboard/profile-tab";

// Componente principal da página da dashboard.
export default function DashboardPage() {
  // Define um estado para armazenar o nome do motorista.
  const [driverName, setDriverName] = useState('');
  // Define o estado da aba ativa. 'pending' é o valor inicial.
  const [activeTab, setActiveTab] = useState('pending');

  // `useEffect` é usado para executar código do lado do cliente após a montagem do componente.
  // Neste caso, ele busca o nome do motorista que foi salvo no `sessionStorage` na tela de login.
  useEffect(() => {
    // `sessionStorage` só está disponível no navegador (cliente), por isso o código está aqui.
    const name = sessionStorage.getItem('driverName');
    if (name) {
      setDriverName(name);
    }
    // O array de dependências `[]` vazio garante que este efeito execute apenas uma vez.
  }, []);

  // =======================================================================
  // INÍCIO DO JSX DO COMPONENTE
  // =======================================================================
  return (
    // Contêiner principal da página com cor de fundo secundária.
    <div className="flex flex-col min-h-screen bg-secondary/50">
      {/* Cabeçalho fixo da página. */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Seção da logo e título. */}
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
            {/* Seção do perfil do usuário e botão de logout. */}
            <div className="flex items-center gap-3">
               {/* Ao clicar no avatar, a aba ativa muda para 'profile'. */}
               <button onClick={() => setActiveTab('profile')} className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Avatar>
                  <AvatarImage src="https://picsum.photos/seed/driver/100/100" alt="Motorista" data-ai-hint="driver portrait" />
                  {/* O `AvatarFallback` mostra a inicial do nome do motorista enquanto a imagem carrega, ou se ela falhar. */}
                  <AvatarFallback>{driverName ? driverName.charAt(0) : 'M'}</AvatarFallback>
                </Avatar>
               </button>
              {/* O nome do motorista é exibido aqui, mas escondido em telas pequenas (`sm:block`). */}
              <p className="text-sm font-medium text-foreground hidden sm:block truncate">{driverName}</p>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal da página. */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-1">
        {/* Renderização condicional: se a aba de perfil NÃO estiver ativa, mostra a saudação e as abas. */}
        {activeTab !== 'profile' ? (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo, {driverName || 'Motorista'}!</h2>
              <p className="text-muted-foreground">Aqui estão suas atualizações mais recentes.</p>
            </div>

            {/* Componente de Abas (`Tabs`) para organizar o conteúdo da dashboard. */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Lista de gatilhos (os "botões" das abas). */}
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-auto">
                <TabsTrigger value="pending" className="py-2.5">
                  <Map className="w-4 h-4 mr-2"/>
                  Pendentes
                </TabsTrigger>
                <TabsTrigger value="delivered" className="py-2.5">
                  <CheckCheck className="w-4 h-4 mr-2"/>
                  Entregues
                </TabsTrigger>
              </TabsList>
              
              {/* Conteúdo de cada aba. Apenas o conteúdo da aba ativa é exibido. */}
              <TabsContent value="pending" className="mt-6">
                <PendingTab />
              </TabsContent>
              <TabsContent value="delivered" className="mt-6">
                <DeliveredTab />
              </TabsContent>
            </Tabs>
          </>
        ) : (
           /* Renderização condicional: se a aba de perfil ESTIVER ativa, mostra apenas o componente de perfil. */
           /* Passa o nome do motorista e a função para mudar de aba como propriedades. */
          <ProfileTab driverName={driverName} onBack={() => setActiveTab('pending')}/>
        )}
      </main>
    </div>
  );
}
