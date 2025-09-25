'use client';

// Importa os hooks do React para gerenciar estado e ciclo de vida.
import { useActionState, useEffect } from 'react';
// Importa um hook específico para obter o status de um formulário (ex: se está sendo enviado).
import { useFormStatus } from 'react-dom';
// Importa o hook customizado para exibir notificações (toasts).
import { useToast } from '@/hooks/use-toast';
// Importa o hook do Next.js para navegação programática entre páginas.
import { useRouter } from 'next/navigation';
// Importa a Server Action de login.
import { login } from '@/app/actions';

// Importa os componentes de UI da biblioteca ShadCN.
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react'; // Ícone de carregamento.
import Image from 'next/image'; // Componente de imagem otimizada do Next.js.

// Define o estado inicial para a Server Action.
const initialState = {
  success: false,       // Indica se a ação foi bem-sucedida.
  message: null,        // Armazena mensagens de sucesso ou erro globais.
  errors: {},           // Armazena erros de validação específicos de cada campo.
  driverName: null,     // Armazena o nome do motorista após o login bem-sucedido.
};

// Componente para o botão de envio do formulário.
function SubmitButton() {
  // `useFormStatus` obtém o status de envio do formulário pai.
  // `pending` será `true` enquanto a Server Action estiver em execução.
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full"
      // Desabilita o botão durante o envio para evitar cliques duplicados.
      disabled={pending}
      size="lg"
    >
      {/* Exibe um ícone de carregamento se o formulário estiver sendo enviado. */}
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Entrar
    </Button>
  );
}

// Componente principal do formulário de login.
export function LoginForm() {
  const router = useRouter(); // Hook para controlar a navegação.
  const { toast } = useToast(); // Hook para disparar notificações.
  
  // `useActionState` gerencia o estado do formulário que usa uma Server Action.
  // `state` contém a resposta da action (sucesso, erros, mensagens).
  // `formAction` é a função que será chamada quando o formulário for submetido.
  const [state, formAction] = useActionState(login, initialState);

  // `useEffect` executa um "efeito colateral" sempre que os valores em seu array de dependências mudam.
  // Neste caso, ele observa o `state` retornado pela Server Action.
  useEffect(() => {
    // Se a action retornou sucesso e o nome do motorista...
    if (state?.success && state?.driverName) {
      // Exibe uma notificação de sucesso.
      toast({
        title: 'Sucesso!',
        description: state.message,
      });
      // Salva o nome do motorista no `sessionStorage` para ser usado em outras páginas (como o dashboard).
      sessionStorage.setItem('driverName', state.driverName);
      
      // Aguarda 500ms para o usuário ver o toast antes de redirecionar.
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } 
    // Se a action retornou uma mensagem de erro (e não é apenas um erro de validação)...
    else if (state?.message && state.message !== 'Dados inválidos.') {
      // Exibe uma notificação de erro.
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: state.message,
      });
    }
    // O array de dependências garante que este código só execute quando `state`, `router` ou `toast` mudarem.
  }, [state, router, toast]);

  return (
    <Card className="w-full max-w-sm shadow-none border-none bg-transparent">
      <form action={formAction}>
        <CardHeader className="flex flex-col items-center text-center space-y-4">
          <div className="w-[150px] h-[150px] md:w-[180px] md:h-[180px] relative">
            <Image
              src="/LogiDesk.Logo.png"
              alt="LogiDesk Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-2xl md:text-4xl font-bold tracking-wider text-foreground">LogiDesk</CardTitle>
            <p className="text-base md:text-lg text-primary font-semibold">Motorista</p>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 mt-4">
          <div className="grid gap-2">
            <Input id="usuario" type="text" name="usuario" placeholder="Usuário" required aria-describedby='usuario-error' className="bg-input border-none rounded-full px-5 py-3" />
            <div id="usuario-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.usuario && <p className="text-sm font-medium text-destructive">{state.errors.usuario[0]}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Input id="senha" type="password" name="senha" placeholder="Senha" required aria-describedby='senha-error' className="bg-input border-none rounded-full px-5 py-3"/>
            <div id="senha-error" aria-live="polite" aria-atomic="true">
             {state?.errors?.senha && <p className="text-sm font-medium text-destructive">{state.errors.senha[0]}</p>}
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
