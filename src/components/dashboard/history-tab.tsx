'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, AlertCircle, CheckCircle, PackageSearch } from "lucide-react";
import { Button } from "../ui/button";
import type { Route } from './pending-tab';

interface HistoryTabProps {
  historyItems: Route[];
}

export default function HistoryTab({ historyItems }: HistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Histórico do Dia
        </CardTitle>
        <CardDescription>
          Todas as entregas finalizadas hoje (sucessos e falhas).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {historyItems.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-22rem)] md:h-[400px]">
            <ul className="space-y-4">
              {historyItems.map((item) => (
                <li key={item.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <Badge variant={item.status === 'entregue' ? 'success' : 'destructive'}>
                         {item.status === 'entregue' ? <CheckCircle className="w-3 h-3 mr-1"/> : <AlertCircle className="w-3 h-3 mr-1"/>}
                         {item.status}
                       </Badge>
                       {item.status === 'falha' && (
                         <Button variant="secondary" size="sm">Tentar Novamente</Button>
                       )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/20 min-h-[300px] flex flex-col justify-center items-center">
              <PackageSearch className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                  O histórico de hoje está vazio.
              </p>
              <p className="text-sm text-muted-foreground/80 mt-2">
                  Quando você finalizar uma entrega, ela aparecerá aqui.
              </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
