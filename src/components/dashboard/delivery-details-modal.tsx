
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Route } from "./pending-tab";

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: Route | null;
}

export function DeliveryDetailsModal({ isOpen, onClose, delivery }: DeliveryDetailsModalProps) {
  if (!isOpen || !delivery) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Entrega</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre a encomenda e a entrega.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm font-medium text-right col-span-1">Status</p>
            <div className="col-span-3">
                <Badge variant={delivery.status === 'entregue' ? 'success' : 'destructive'}>
                    {delivery.status === 'entregue' ? 'Entregue' : 'Falha'}
                </Badge>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm font-medium text-right col-span-1">ID</p>
            <p className="text-sm col-span-3">{delivery.id}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm font-medium text-right col-span-1">Título</p>
            <p className="text-sm col-span-3">{delivery.title}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm font-medium text-right col-span-1">Endereço</p>
            <p className="text-sm col-span-3">{delivery.address}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
