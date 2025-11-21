'use client';

// Importa hooks do React e Next.js.
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
// Importa a Server Action de logout.
import { logout } from '@/app/actions';
// Importa componentes de UI da biblioteca ShadCN.
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
// Importa ícones da biblioteca lucide-react.
import { LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


// Componente que renderiza um botão de logout com uma caixa de diálogo de confirmação.
export function LogoutButton() {
  const router = useRouter(); 
  const { toast } = useToast();
  
  // `useTransition` é um hook do React que permite atualizar o estado sem bloquear a UI.
  // `isPending` será `true` durante a transição (enquanto o logout está acontecendo).
  // `startTransition` envolve a lógica assíncrona do logout.
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    const driverId = sessionStorage.getItem('driverId');
    if (!driverId) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível encontrar o ID do motorista para atualizar o status.',
        });
        return;
    }

    // Inicia a transição de logout.
    startTransition(async () => {
        try {
            // 1. Chama a Server Action de logout, passando o ID do motorista.
            // A action agora é responsável por atualizar o status no banco de dados.
            const result = await logout(driverId);
            
            if (!result.success) {
                throw new Error(result.message || 'Falha ao atualizar o status para offline.');
            }
        
            // 2. Limpa os dados da sessão.
            sessionStorage.removeItem('driverName');
            sessionStorage.removeItem('driverId');
            
            // 3. Redireciona o usuário para a página inicial (tela de login).
            router.push('/');

             toast({
                title: 'Desconectado',
                description: 'Sessão Encerrada. Você foi redirecionado para a tela de login.',
            });

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Erro ao Sair',
                description: error.message,
            });
        }
    });
  };

  return (
    // O `AlertDialog` envolve o botão e gerencia a exibição da caixa de diálogo.
    <AlertDialog>
      {/* O `AlertDialogTrigger` é o elemento que abre a caixa de diálogo (neste caso, o botão de logout). */}
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Sair">
          <LogOut className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      {/* O `AlertDialogContent` é o conteúdo da caixa de diálogo que aparece na tela. */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
          <AlertDialogDescription>
            Você será redirecionado para a tela de login e seu status será definido como offline.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Botão para cancelar a ação e fechar a caixa de diálogo. */}
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {/* Botão para confirmar a ação de logout. */}
          <AlertDialogAction onClick={handleLogout} disabled={isPending}>
            {/* Exibe um ícone de carregamento enquanto o logout está em andamento. */}
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
