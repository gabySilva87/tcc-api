'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2 } from 'lucide-react';

const initialState = {
  message: null,
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      className="w-full bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white"
      disabled={pending}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Entrar
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);
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
    <Card className="w-full max-w-sm shadow-lg">
      <form action={formAction}>
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline mt-4">Driver Login</CardTitle>
          <CardDescription>Acesse sua rota e notificações.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="motorista@exemplo.com" required aria-describedby='email-error' />
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" type="text" name="cpf" placeholder="123.456.789-00" required aria-describedby='cpf-error'/>
            <div id="cpf-error" aria-live="polite" aria-atomic="true">
             {state?.errors?.cpf && <p className="text-sm font-medium text-destructive">{state.errors.cpf[0]}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
