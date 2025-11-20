
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw, History } from 'lucide-react';
import type { Route } from "./pending-tab";
import { DeliveryDetailsModal } from './delivery-details-modal';

interface HistoryTabProps {
    historyItems: Route[];
    onRetry: (route: Route) => void;
}

// Componente corrigido para usar 'Nentregue' e 'clientName'
const HistoryTab: React.FC<HistoryTabProps> = ({ historyItems, onRetry }) => {
    const [showRetryDialog, setShowRetryDialog] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

    const handleRetryClick = (route: Route) => {
        setSelectedRoute(route);
        setShowRetryDialog(true);
    };

    const handleDetailsClick = (route: Route) => {
        setSelectedRoute(route);
        setShowDetailsModal(true);
    };

    const handleConfirmRetry = () => {
        if (selectedRoute) {
            onRetry(selectedRoute);
        }
        setShowRetryDialog(false);
        setSelectedRoute(null);
    };

    if (historyItems.length === 0) {
        return (
            <div className="text-center text-muted-foreground mt-12 flex flex-col items-center gap-4">
                <History className="w-16 h-16 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">Nenhum histórico hoje</h3>
                <p className="text-sm">As entregas que você finalizar aparecerão aqui.</p>
            </div>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Histórico do Dia</CardTitle>
                    <p className="text-sm text-muted-foreground">Lista de todas as entregas finalizadas hoje (sucessos e falhas).</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {historyItems.map((item,index) => (
                            <div key={`${item.id}-${index}`} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg shadow-sm cursor-pointer hover:bg-secondary transition-colors" onClick={() => handleDetailsClick(item)}>
                                <p className="font-semibold text-foreground">{item.clientName || `Entrega #${item.id}`}</p>
                                <div className="flex items-center gap-4">
                                    <Badge variant={item.status === 'entregue' ? 'success' : 'destructive'}>
                                        {item.status === 'entregue' ? 'Entregue' : 'Não Entregue'} 
                                    </Badge>
                                    {item.status === 'Nentregue' && ( // CORREÇÃO: Verifica por 'Nentregue'
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleRetryClick(item); }} 
                                            className="flex items-center gap-2 text-primary hover:text-primary"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Tentar Novamente
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Nova Tentativa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza de que deseja mover a entrega para "{selectedRoute?.clientName}" de volta para a lista de pendentes?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedRoute(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRetry}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DeliveryDetailsModal 
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                delivery={selectedRoute}
            />
        </>
    );
};

export default HistoryTab;
