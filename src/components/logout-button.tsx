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

// Componente que renderiza um botão de logout com uma caixa de diálogo de confirmação.
export function LogoutButton() {
  const router = useRouter(); // Hook para navegação.
  
  // `useTransition` é um hook do React que permite atualizar o estado sem bloquear a UI.
  // `isPending` será `true` durante a transição (enquanto o logout está acontecendo).
  // `startTransition` envolve a lógica assíncrona do logout.
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    // Inicia a transição de logout.
    startTransition(async () => {
      // Limpa o nome do motorista do `sessionStorage` para garantir que ele não persista
      // após o logout.
      sessionStorage.removeItem('driverName');
      
      // Chama a Server Action de logout.
      await logout();
      
      // Redireciona o usuário para a página inicial (tela de login).
      router.push('/');
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
            Você será redirecionado para a tela de login e precisará inserir suas credenciais novamente para acessar o painel.
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
