
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
import { Package, User, MapPin, Calendar, Hash } from 'lucide-react'; // Ícones adicionados

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: Route | null;
}

// Modal corrigido para exibir todos os detalhes e a data condicionalmente.
export function DeliveryDetailsModal({ isOpen, onClose, delivery }: DeliveryDetailsModalProps) {
  if (!isOpen || !delivery) {
    return null;
  }

  const isSuccess = delivery.status === 'entregue';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Entrega</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre a encomenda e a entrega finalizada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground flex items-center"><User className="w-4 h-4 mr-2"/>Cliente</p>
            <p className="text-sm font-semibold">{delivery.clientName}</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground flex items-center"><Package className="w-4 h-4 mr-2"/>Produto</p>
            <p className="text-sm font-semibold">{delivery.productName}</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground flex items-center"><MapPin className="w-4 h-4 mr-2"/>Endereço</p>
            <p className="text-sm font-semibold text-right">{delivery.address}</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground flex items-center"><Hash className="w-4 h-4 mr-2"/>Nº da Encomenda</p>
            <p className="text-sm font-semibold">{delivery.title}</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge variant={isSuccess ? 'success' : 'destructive'}>
                {isSuccess ? 'Entregue' : 'Falha na Entrega'}
            </Badge>
          </div>

          {/* A data só é exibida se a entrega foi um sucesso */}
          {isSuccess && delivery.deliveryDate && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground flex items-center"><Calendar className="w-4 h-4 mr-2"/>Data da Entrega</p>
              <p className="text-sm font-semibold">{delivery.deliveryDate}</p>
            </div>
          )}

        </div>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
