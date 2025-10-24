
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ReportProblemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deliveryId = params.id as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, descreva o problema.' });
      return;
    }

    setIsSubmitting(true);
    const driverId = sessionStorage.getItem('driverId');

    try {
      const response = await fetch(`/api/encomendas/update-status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            encomendaId: deliveryId,
            status: 'Não entregue', // <-- Valor salvo no banco de dados
            problem: description,
            driverId: driverId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao reportar o problema.');
      }

      // Mensagem de sucesso para o usuário
      toast({ title: 'Problema Reportado', description: 'A entrega foi marcada com falha e movida para o histórico.' });
      router.push('/dashboard');

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao Enviar', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50 p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Voltar</span>
            </Button>
        </header>
        <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    {/* Textos que o usuário vê */}
                    <CardTitle>Relatar Problema na Entrega</CardTitle>
                    <CardDescription>Descreva o que aconteceu com a entrega #{deliveryId}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid w-full gap-2">
                            <Textarea
                                id="description"
                                placeholder="Ex: O cliente não estava em casa, endereço incorreto, etc."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                         {/* Textos que o usuário vê */}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Enviar Relatório de Falha'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
