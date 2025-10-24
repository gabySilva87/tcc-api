
import { useState, useEffect } from "react";
import { DeliveryConfirmationDialog } from "./delivery-confirmation-dialog";

interface DeliveryFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeliveryFlow({ isOpen, onClose, onConfirm }: DeliveryFlowProps) {
  const [step1Open, setStep1Open] = useState(false);
  const [step2Open, setStep2Open] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep1Open(true);
    } else {
      setStep1Open(false);
      setStep2Open(false);
    }
  }, [isOpen]);

  const handleStep1Confirm = () => {
    setStep1Open(false);
    setStep2Open(true);
  };

  const handleStep2Confirm = () => {
    setStep2Open(false);
    onConfirm();
    onClose();
  };

  const handleClose = () => {
    setStep1Open(false);
    setStep2Open(false);
    onClose();
  };

  return (
    <>
      <DeliveryConfirmationDialog
        isOpen={step1Open}
        onClose={handleClose}
        onConfirm={handleStep1Confirm}
        title="Confirmar Entrega"
        description="Você tem certeza que deseja confirmar a entrega desta encomenda?"
        confirmText="Sim, continuar"
        cancelText="Cancelar"
      />
      <DeliveryConfirmationDialog
        isOpen={step2Open}
        onClose={handleClose}
        onConfirm={handleStep2Confirm}
        title="Confirmação Final"
        description="Esta ação não pode ser desfeita. Confirma a entrega da encomenda?"
        confirmText="Confirmar Entrega"
        cancelText="Voltar"
      />
    </>
  );
}
