
'use client';

// Importa os hooks do React para gerenciar estado e ciclo de vida.
import { useState, useEffect } from "react";
// Importa componentes de UI da biblioteca ShadCN.
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Importa ícones da biblioteca lucide-react.
import { User, Map, BarChart2 } from "lucide-react";
// Importa o componente de imagem otimizada do Next.js.
import Image from "next/image";

// Importa componentes customizados da aplicação.
import { LogoutButton } from "@/components/logout-button";
import RoutesTab from "@/components/dashboard/routes-tab";
import ProfileTab from "@/components/dashboard/profile-tab";
import ReportsTab from "@/components/dashboard/reports-tab";

// Componente principal da página da dashboard.
export default function DashboardPage() {
  // Define um estado para armazenar o nome do motorista.
  const [driverName, setDriverName] = useState('');

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
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="LogiDesk Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <h1 className="text-lg sm:text-xl font-bold text-foreground shrink-0">Driver</h1>
            </div>
            {/* Seção do perfil do usuário e botão de logout. */}
            <div className="flex items-center gap-3">
               <Avatar>
                <AvatarImage src="https://picsum.photos/seed/driver/100/100" alt="Motorista" data-ai-hint="driver portrait" />
                {/* O `AvatarFallback` mostra a inicial do nome do motorista enquanto a imagem carrega, ou se ela falhar. */}
                <AvatarFallback>{driverName ? driverName.charAt(0) : 'M'}</AvatarFallback>
              </Avatar>
              {/* O nome do motorista é exibido aqui, mas escondido em telas pequenas (`sm:block`). */}
              <p className="text-sm font-medium text-foreground hidden sm:block truncate">{driverName}</p>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal da página. */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-1">
        <div className="mb-8">
          {/* O nome do motorista é exibido dinamicamente na saudação. */}
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo, {driverName || 'Motorista'}!</h2>
          <p className="text-muted-foreground">Aqui estão suas atualizações mais recentes.</p>
        </div>

        {/* Componente de Abas (`Tabs`) para organizar o conteúdo da dashboard. */}
        <Tabs defaultValue="routes" className="w-full">
          {/* Lista de gatilhos (os "botões" das abas). */}
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-auto">
            <TabsTrigger value="routes" className="py-2.5">
              <Map className="w-4 h-4 mr-2"/>
              Rotas
            </TabsTrigger>
            <TabsTrigger value="profile" className="py-2.5">
              <User className="w-4 h-4 mr-2"/>
              Perfil
            </TabsTrigger>
            <TabsTrigger value="reports" className="py-2.5">
              <BarChart2 className="w-4 h-4 mr-2"/>
              Relatórios
            </TabsTrigger>
          </TabsList>
          
          {/* Conteúdo de cada aba. Apenas o conteúdo da aba ativa é exibido. */}
          <TabsContent value="routes" className="mt-6">
            <RoutesTab />
          </TabsContent>
          <TabsContent value="profile" className="mt-6">
            {/* Passa o nome do motorista como propriedade para a aba de perfil. */}
            <ProfileTab driverName={driverName}/>
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
