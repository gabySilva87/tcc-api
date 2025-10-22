'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCheck, PackageCheck } from "lucide-react";
import type { Route } from './pending-tab';

interface DeliveredTabProps {
  deliveredRoutes: Route[];
}

export default function DeliveredTab({ deliveredRoutes }: DeliveredTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCheck className="w-6 h-6 text-primary" />
          Entregas Realizadas com Sucesso
        </CardTitle>
        <CardDescription>
          Aqui estão as entregas que você concluiu com sucesso hoje.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {deliveredRoutes.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-22rem)] md:h-[400px]">
            <ul className="space-y-4">
              {deliveredRoutes.map((route) => (
                <li key={route.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{route.title}</p>
                      <p className="text-sm text-muted-foreground">{route.description}</p>
                    </div>
                    <Badge variant="success">Entregue</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/20 min-h-[300px] flex flex-col justify-center items-center">
              <PackageCheck className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                  Nenhuma entrega concluída ainda.
              </p>
              <p className="text-sm text-muted-foreground/80 mt-2">
                  Complete uma entrega na aba "Pendentes" para vê-la aqui.
              </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
