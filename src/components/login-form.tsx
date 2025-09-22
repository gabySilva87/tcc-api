'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const initialState = {
  message: null,
  errors: {},
};

const LogiDeskLogo = () => (
    <svg
      className="w-20 h-20 text-primary"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 3L10 11V27L24 35L38 27V11L24 3Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 35L10 43L10 27"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 35L38 43L38 27"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11L24 19L38 11"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 19V35"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );


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

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message && state.message !== 'Dados inválidos.') {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-sm shadow-none border-none">
      <form action={formAction}>
        <CardHeader className="text-center items-center space-y-4">
          <LogiDeskLogo />
          <CardTitle className="text-3xl font-bold tracking-wider text-foreground">LogiDesk</CardTitle>
          <p className="text-lg text-primary font-semibold">Motorista</p>
        </CardHeader>
        <CardContent className="grid gap-6 mt-4">
          <div className="grid gap-2 text-left">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" type="text" name="nome" required aria-describedby='nome-error' className="bg-input border-none rounded-full px-5 py-6" />
            <div id="nome-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.nome && <p className="text-sm font-medium text-destructive">{state.errors.nome[0]}</p>}
            </div>
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" name="senha" required aria-describedby='senha-error' className="bg-input border-none rounded-full px-5 py-6"/>
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
