'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { login } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

// Define o estado inicial para a Server Action.
// - `success`: indica se a ação foi bem-sucedida.
// - `message`: armazena mensagens de sucesso ou erro globais.
// - `errors`: armazena erros específicos de cada campo do formulário.
// - `driverName`: armazena o nome do motorista retornado após o login.
const initialState = {
  success: false,
  message: null,
  errors: {},
  driverName: null,
};

// Componente do botão de submit, que mostra um ícone de carregamento
// enquanto a ação do formulário está sendo processada.
function SubmitButton() {
  // O hook `useFormStatus` obtém o status de envio de um formulário pai.
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full"
      // Desabilita o botão enquanto o formulário está sendo enviado para evitar cliques duplos.
      disabled={pending}
      size="lg"
    >
      {/* Mostra um ícone de carregamento se o `pending` for true. */}
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Entrar
    </Button>
  );
}

// Componente principal do formulário de login.
export function LoginForm() {
  const router = useRouter(); // Hook para navegação entre páginas.
  const { toast } = useToast(); // Hook para exibir notificações (toasts).
  
  // `useActionState` é um hook do React para gerenciar o estado de formulários que usam Server Actions.
  // `state` contém as respostas da action (erros, mensagens).
  // `formAction` é a função que aciona a Server Action `login` quando o formulário é enviado.
  const [state, formAction] = useActionState(login, initialState);

  // `useEffect` é um hook que executa efeitos colaterais.
  // Este observa mudanças no `state` retornado pela Server Action.
  useEffect(() => {
    // Se a action retornar sucesso e o nome do motorista, exibe um toast de sucesso.
    if (state?.success && state?.driverName) {
      toast({
        title: 'Sucesso!',
        description: state.message,
      });
      // Salva o nome do motorista no sessionStorage para ser usado na dashboard.
      sessionStorage.setItem('driverName', state.driverName);
      
      // Adiciona um pequeno delay para o usuário ver o toast antes de redirecionar para o dashboard.
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } 
    // Se retornar uma mensagem de erro, exibe um toast de erro.
    else if (state?.message && state.message !== 'Dados inválidos.') {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: state.message,
      });
    }
  }, [state, router, toast]); // O array de dependências garante que o efeito só rode quando um desses valores mudar.

  return (
    <Card className="w-full max-w-sm shadow-none border-none bg-transparent">
      {/* O atributo `action` do formulário aponta para a nossa Server Action. */}
      <form action={formAction}>
        <CardHeader className="text-center items-center space-y-2">
          {/* Componente `Image` do Next.js para otimização de imagem. */}
          <Image
              src="/logo.png"
              alt="LogiDesk Logo"
              width={200}
              height={200}
              className="object-contain"
            />

          <CardTitle className="text-4xl font-bold tracking-wider text-foreground">LogiDesk</CardTitle>
          <p className="text-lg text-primary font-semibold pt-4">Motorista</p>
        </CardHeader>
        <CardContent className="grid gap-6 mt-4">
          <div className="grid gap-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" required aria-describedby='email-error' className="bg-input border-none rounded-full px-5 py-6 text-background" />
            {/* Área para exibir mensagens de erro específicas do campo de email, se houver. */}
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
            </div>
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" name="senha" required aria-describedby='senha-error' className="bg-input border-none rounded-full px-5 py-6 text-background"/>
            {/* Área para exibir mensagens de erro específicas do campo de senha, se houver. */}
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
