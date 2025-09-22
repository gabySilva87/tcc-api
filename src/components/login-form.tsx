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

// Estado inicial para a Server Action. `message` guarda mensagens de erro globais,
// e `errors` guarda erros específicos de cada campo do formulário.
const initialState = {
  success: false,
  message: null,
  errors: {},
};

// Componente do botão de submit, que mostra um ícone de carregamento
// enquanto o formulário está sendo enviado.
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full"
      disabled={pending}
      size="lg"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Entrar
    </Button>
  );
}

// Componente principal do formulário de login.
export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  // `useActionState` é um hook do React para gerenciar o estado de formulários que usam Server Actions.
  // `state` contém as respostas da action (erros, mensagens), e `formAction` é o que aciona a action.
  const [state, formAction] = useActionState(login, initialState);

  // `useEffect` para observar mudanças no estado e exibir toasts ou redirecionar.
  useEffect(() => {
    // Se a action retornar sucesso, redireciona para o dashboard.
    if (state?.success) {
      toast({
        title: 'Sucesso!',
        description: state.message,
      });
      // Adiciona um pequeno delay para o usuário ver o toast antes de redirecionar.
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } 
    // Se retornar um erro, exibe o toast de erro.
    else if (state?.message && state.message !== 'Dados inválidos.') {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: state.message,
      });
    }
  }, [state, router, toast]);

  return (
    <Card className="w-full max-w-sm shadow-none border-none bg-transparent">
      {/* O atributo `action` do formulário aponta para a nossa Server Action. */}
      <form action={formAction}>
        <CardHeader className="text-center items-center space-y-2">
          <Image
            src="https://picsum.photos/seed/logo/80/80"
            alt="LogiDesk Logo"
            width={80}
            height={80}
            className="rounded-full"
            data-ai-hint="logo logistics"
          />
          <CardTitle className="text-4xl font-bold tracking-wider text-foreground">LogiDesk</CardTitle>
          <p className="text-lg text-primary font-semibold pt-4">Acesso do Motorista</p>
        </CardHeader>
        <CardContent className="grid gap-6 mt-4">
          <div className="grid gap-2 text-left">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" type="text" name="nome" required aria-describedby='nome-error' className="bg-input border-none rounded-full px-5 py-6 text-background" />
            {/* Área para exibir mensagens de erro específicas do campo de nome. */}
            <div id="nome-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.nome && <p className="text-sm font-medium text-destructive">{state.errors.nome[0]}</p>}
            </div>
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" type="text" name="cpf" required aria-describedby='cpf-error' className="bg-input border-none rounded-full px-5 py-6 text-background"/>
            {/* Área para exibir mensagens de erro específicas do campo de CPF. */}
            <div id="cpf-error" aria-live="polite" aria-atomic="true">
             {state?.errors?.cpf && <p className="text-sm font-medium text-destructive">{state.errors.cpf[0]}</p>}
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
