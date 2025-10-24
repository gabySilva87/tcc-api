
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { Route } from './pending-tab';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
  onSuccess: () => void;
}

const QUICK_REASONS = [
  'Cliente ausente',
  'Endereço não localizado',
  'Recusado pelo destinatário',
  'Fora do horário comercial',
];

export function ReportProblemModal({ isOpen, onClose, route, onSuccess }: ReportProblemModalProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickReasonClick = (reason: string) => {
    setDescription(prev => (prev ? `${prev}, ${reason}` : reason));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const driverId = sessionStorage.getItem('driverId');

    if (!route || !driverId) {
      toast({
        variant: 'destructive',
        title: 'Erro de Aplicação',
        description: 'Não foi possível encontrar os detalhes da entrega ou do motorista.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/encomendas/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encomendaId: route.id,
          status: 'Nentregue', // <<< CORRIGIDO AQUI!
          problem: description || 'Motivo não especificado.',
          driverId: driverId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ocorreu um erro no servidor.');
      }

      toast({
        title: 'Problema Reportado com Sucesso',
        description: `A entrega #${route.id} foi marcada como 'Não entregue'.`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Enviar',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
      setDescription('');
    }
  };
  
  const handleModalClose = () => {
    setDescription('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle>Reportar Problema na Entrega</DialogTitle>
          {route && (
            <DialogDescription>
              O que aconteceu com a entrega para <span className="font-semibold text-primary">{route.clientName}</span>?
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">Selecione um motivo rápido (opcional):</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REASONS.map(reason => (
              <Button
                key={reason}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReasonClick(reason)}
                disabled={isSubmitting}
              >
                {reason}
              </Button>
            ))}
          </div>

          <Textarea
            id="description"
            placeholder="Ou descreva o problema (opcional)..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="mt-2"
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Enviando...' : 'Confirmar Falha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
