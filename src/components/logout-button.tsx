'use client';

import { useTransition } from 'react';
import { logout } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    const driverId = sessionStorage.getItem('driverId');

    startTransition(async () => {
      // Chama a Server Action de logout primeiro.
      await logout(driverId || '');
      
      // Limpa o sessionStorage *depois* que a ação do servidor foi concluída.
      sessionStorage.removeItem('driverName');
      sessionStorage.removeItem('driverId');
      
      // Redireciona o usuário para a página inicial forçando um recarregamento completo.
      // Isso garante que todo o estado do cliente seja limpo, evitando a tela em branco.
      window.location.href = '/';
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Sair">
          <LogOut className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
          <AlertDialogDescription>
            Você será redirecionado para a tela de login e precisará inserir suas credenciais novamente para acessar o painel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
