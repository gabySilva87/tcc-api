
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary" />
          Relatórios de Desempenho
        </CardTitle>
        <CardDescription>
          Visualize e exporte seus relatórios de entregas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <p>Selecione um período:</p>
            </div>
             <div className="flex gap-2">
                <Button variant="outline">Semanal</Button>
                <Button variant="outline">Mensal</Button>
                <Button variant="outline">Anual</Button>
            </div>
        </div>

        <div className="border rounded-lg p-6 text-center bg-muted/20">
            <p className="text-muted-foreground">
                A funcionalidade de gráficos e relatórios está em desenvolvimento.
            </p>
            <p className="text-sm text-muted-foreground/80 mt-2">
                Em breve, você poderá ver seu histórico de entregas e desempenho aqui.
            </p>
        </div>
        
        <Button disabled className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório (Em Breve)
        </Button>
      </CardContent>
    </Card>
  );
}
