
'use client';

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Map, BarChart2 } from "lucide-react";
import Image from "next/image";

import { LogoutButton } from "@/components/logout-button";
import RoutesTab from "@/components/dashboard/routes-tab";
import ProfileTab from "@/components/dashboard/profile-tab";
import ReportsTab from "@/components/dashboard/reports-tab";

export default function DashboardPage() {
  const [driverName, setDriverName] = useState('');

  useEffect(() => {
    // Busca o nome do motorista do sessionStorage quando o componente é montado no cliente.
    const name = sessionStorage.getItem('driverName');
    if (name) {
      setDriverName(name);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
            <div className="flex items-center gap-3">
               <Avatar>
                <AvatarImage src="https://picsum.photos/seed/driver/100/100" alt="Motorista" data-ai-hint="driver portrait" />
                <AvatarFallback>{driverName ? driverName.charAt(0) : 'M'}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-foreground hidden sm:block truncate">{driverName}</p>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-1">
        <div className="mb-8">
          {/* O nome do motorista é exibido dinamicamente aqui. */}
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo, {driverName || 'Motorista'}!</h2>
          <p className="text-muted-foreground">Aqui estão suas atualizações mais recentes.</p>
        </div>

        <Tabs defaultValue="routes" className="w-full">
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
          
          <TabsContent value="routes" className="mt-6">
            <RoutesTab />
          </TabsContent>
          <TabsContent value="profile" className="mt-6">
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
