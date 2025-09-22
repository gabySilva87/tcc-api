"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Interface para definir a estrutura de dados de uma rota/notificação.
interface Route {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// Componente React para exibir as notificações de rotas.
export default function RouteNotifications() {
  // Estados para gerenciar os dados das rotas, o status de carregamento e possíveis erros.
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `useEffect` é usado para buscar os dados da API quando o componente é montado.
  useEffect(() => {
    async function fetchRoutes() {
      try {
        // Faz uma requisição para a nossa API interna que se conecta ao banco de dados.
        const response = await fetch('/api/routes');
        const data = await response.json();
        
        if (!response.ok) {
          // Se a resposta não for OK, lança um erro com a mensagem vinda da API.
          throw new Error(data.message || 'Falha ao buscar os dados das rotas.');
        }
        // Atualiza o estado com os dados recebidos da API.
        setRoutes(data);
      } catch (err: any) {
        // Em caso de erro, atualiza o estado de erro.
        setError(err.message);
      } finally {
        // Independentemente de sucesso ou erro, define o carregamento como falso.
        setLoading(false);
      }
    }

    fetchRoutes();
  }, []); // O array vazio `[]` garante que o `useEffect` rode apenas uma vez.

  // Calcula o número de notificações não lidas.
  const unreadCount = routes.filter(route => !route.read).length;

  // Se os dados ainda estão sendo carregados, exibe um esqueleto (placeholders de carregamento).
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <CardTitle>Notificações</CardTitle>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 pt-1.5">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                {i < 2 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se ocorreu um erro ao buscar os dados, exibe uma mensagem de erro mais clara.
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
    )
  }

  // Se os dados foram carregados com sucesso, exibe a lista de notificações.
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <CardTitle>Notificações</CardTitle>
        </div>
        {unreadCount > 0 && <Badge variant="default" className="bg-primary/90">{unreadCount} nova{unreadCount > 1 ? 's' : ''}</Badge>}
      </CardHeader>
      <CardContent>
        {routes.length > 0 ? (
          <ul className="space-y-4">
            {routes.map((notification, index) => (
              <li key={notification.id}>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 pt-1.5">
                    <span className={`block h-2.5 w-2.5 rounded-full ${!notification.read ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">{notification.time}</p>
                  </div>
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
                {index < routes.length - 1 && <Separator className="mt-4" />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nenhuma notificação no momento.</p>
        )}
      </CardContent>
    </Card>
  );
}
