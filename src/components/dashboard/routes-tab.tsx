
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';

interface Route {
  id: number;
  title: string;
  description: string;
  address: string;
  status: string;
  time: string;
}

export default function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const response = await fetch('/api/routes');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Falha ao buscar os dados das rotas.');
        }
        setRoutes(data);
        if (data.length > 0) {
            setSelectedRoute(data[0]); // Seleciona a primeira rota por padrão
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, []);

  if (loading) {
    return (
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1 flex flex-col">
                <Skeleton className="h-[500px] w-full" />
            </div>
            <div className="md:col-span-2">
                <Skeleton className="h-[500px] w-full" />
            </div>
        </div>
    );
  }

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
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card className="flex-1 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="w-6 h-6 text-primary" />
                    Entregas Pendentes
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                {routes.length > 0 ? (
                <ScrollArea className="h-[400px]">
                    <ul className="space-y-0">
                    {routes.map((route, index) => (
                        <li key={route.id} onClick={() => setSelectedRoute(route)} className={`cursor-pointer p-4 hover:bg-muted/50 ${selectedRoute?.id === route.id ? 'bg-muted' : ''}`}>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                <p className="font-semibold">{route.title}</p>
                                <p className="text-sm text-muted-foreground">{route.address}</p>
                                <p className="text-xs text-muted-foreground/80 mt-1">{route.time}</p>
                                </div>
                                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                            </div>
                            {index < routes.length - 1 && <Separator className="mt-4" />}
                        </li>
                    ))}
                    </ul>
                </ScrollArea>
                ) : (
                <div className="p-4 text-center text-muted-foreground">
                    <p>Nenhuma entrega pendente no momento.</p>
                </div>
                )}
            </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        {selectedRoute ? (
            <Card>
                <CardHeader>
                    <CardTitle>{selectedRoute.title}</CardTitle>
                    <CardContent className="p-0 pt-2">
                        <p className="text-muted-foreground">{selectedRoute.description}</p>
                    </CardContent>
                </CardHeader>
                <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <Image src="https://picsum.photos/seed/map/400/225" width={400} height={225} alt="Map of next delivery" className="object-cover w-full h-full" data-ai-hint="city map" />
                </div>
                <div className="mt-4 space-y-3">
                    <p className="flex justify-between items-center text-sm"><strong>Horário Previsto:</strong> <span>{selectedRoute.time}</span></p>
                    <p className="flex justify-between items-center text-sm"><strong>Endereço:</strong> <span>{selectedRoute.address}</span></p>
                    <div className="flex justify-between items-center text-sm"><strong>Status:</strong> <Badge variant="success">{selectedRoute.status}</Badge></div>
                </div>
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">Iniciar Rota</Button>
                </CardContent>
            </Card>
        ) : (
            <Card className="flex items-center justify-center h-full">
                <CardContent>
                    <p className="text-muted-foreground">Selecione uma rota para ver os detalhes.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
