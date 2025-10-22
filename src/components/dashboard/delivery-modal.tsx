'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Route } from './pending-tab';
import { validateImage } from '@/ai/flows/validate-image-flow';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route;
  onSuccess: (deliveryId: string | number) => void;
}

export default function DeliveryModal({ isOpen, onClose, route, onSuccess }: DeliveryModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<'camera' | 'confirm' | 'finalizing'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState({ isValid: true, reason: '' });
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const cleanupAndClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setStep('camera');
    setValidationResult({ isValid: true, reason: '' });
    onClose();
  }, [stopCamera, onClose]);


  useEffect(() => {
    const getCameraPermission = async () => {
      if (isOpen && step === 'camera') {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(mediaStream);
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Acesso à Câmera Negado',
            description: 'Por favor, habilite o acesso à câmera nas configurações do seu navegador.',
          });
        }
      }
    };
    
    if (isOpen) {
       getCameraPermission();
    } else {
       stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, step, toast]);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setStep('confirm');
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setValidationResult({ isValid: true, reason: '' });
    setStep('camera');
  };

  const handleConfirm = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    setValidationResult({ isValid: true, reason: '' });

    try {
      const result = await validateImage({ photoDataUri: capturedImage });
      if (!result.isValid) {
        setValidationResult(result);
        setIsLoading(false);
        return;
      }
      
      setStep('finalizing');
      
      const driverId = sessionStorage.getItem('driverId');

      const response = await fetch(`/api/encomendas/${route.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            status: 'entregue', 
            photo: capturedImage,
            driverId: driverId // Envia o ID do motorista para o backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar o status da entrega.');
      }
      
      toast({
        title: 'Entrega Concluída!',
        description: `A encomenda #${route.id} foi marcada como entregue.`,
      });

      onSuccess(route.id);
      cleanupAndClose();

    } catch (error: any) {
      console.error('Error during delivery confirmation:', error);
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: error.message || 'Não foi possível confirmar a entrega. Tente novamente.',
      });
      setStep('confirm'); // Go back to confirmation step on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && cleanupAndClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Entrega: {route.title}</DialogTitle>
          <DialogDescription>
            Tire uma foto do pacote no local da entrega para confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {step === 'camera' && (
            <div className="space-y-4">
              <div className="w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                <canvas ref={canvasRef} className="hidden" />
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <div className="text-center p-4">
                        <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground mt-2">Câmera indisponível</p>
                    </div>
                )}
              </div>
              {hasCameraPermission === false && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Câmera Requerida</AlertTitle>
                  <AlertDescription>
                    Por favor, permita o acesso à câmera para continuar.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 'confirm' && capturedImage && (
            <div className="space-y-4">
              <img src={capturedImage} alt="Captured proof of delivery" className="rounded-md w-full aspect-video object-cover" />
              {!validationResult.isValid && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Problema na Imagem</AlertTitle>
                  <AlertDescription>{validationResult.reason}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 'finalizing' && (
             <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <h3 className="text-lg font-semibold">Finalizando Entrega...</h3>
                <p className="text-muted-foreground">Aguarde enquanto salvamos as informações.</p>
             </div>
          )}
        </div>

        <DialogFooter>
          {step === 'camera' && (
            <Button onClick={handleCapture} disabled={!hasCameraPermission || isLoading} className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Capturar Foto
            </Button>
          )}

          {step === 'confirm' && (
            <div className="w-full grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleRetake} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tirar Outra
              </Button>
              <Button onClick={handleConfirm} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Confirmar Entrega
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
