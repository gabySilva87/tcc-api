'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Route } from './pending-tab';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route;
  onSuccess: (deliveryId: string | number) => void;
  onFailure: (deliveryId: string | number) => void; // Callback para falha
}

export default function DeliveryModal({ isOpen, onClose, route, onSuccess, onFailure }: DeliveryModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<'success' | 'fail' | null>(null);

  const handleUpdateStatus = async (status: 'entregue' | 'falha') => {
    setAction(status === 'entregue' ? 'success' : 'fail');
    setIsLoading(true);
    try {
      const driverId = sessionStorage.getItem('driverId');

      const response = await fetch(`/api/encomendas/${route.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, driverId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar o status.');
      }

      if (status === 'entregue') {
        toast({ title: 'Entrega Concluída!', description: `A encomenda #${route.id} foi marcada como entregue.` });
        onSuccess(route.id);
      } else {
        toast({ variant: 'default', title: 'Entrega Não Realizada', description: `A encomenda #${route.id} foi marcada como falha.` });
        onFailure(route.id);
      }
      
      onClose();

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro!', description: error.message });
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Status da Entrega</DialogTitle>
          <DialogDescription>
            Selecione o status para a encomenda "{route.title}".
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4">
          <Button 
            variant="destructive"
            onClick={() => handleUpdateStatus('falha')}
            disabled={isLoading}
            className="sm:col-span-1"
           >
            {isLoading && action === 'fail' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
            Falha
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="sm:col-span-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => handleUpdateStatus('entregue')}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 sm:col-span-1"
          >
            {isLoading && action === 'success' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Entregue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
