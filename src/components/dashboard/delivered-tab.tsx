
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCheck } from "lucide-react";

// Este é um componente de placeholder para a aba de entregas concluídas.
export default function DeliveredTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCheck className="w-6 h-6 text-primary" />
          Entregas Realizadas
        </CardTitle>
        <CardDescription>
          Histórico de entregas que você já concluiu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-6 text-center bg-muted/20">
            <p className="text-muted-foreground">
                A funcionalidade de histórico de entregas está em desenvolvimento.
            </p>
            <p className="text-sm text-muted-foreground/80 mt-2">
                Em breve, você poderá ver todas as suas entregas concluídas aqui.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
