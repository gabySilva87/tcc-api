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

const initialState = {
  success: false,
  message: null,
  errors: {},
  driverName: null,
};

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
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(login, initialState);

  useEffect(() => {
    if (state?.success && state?.driverName) {
      toast({
        title: 'Sucesso!',
        description: state.message,
      });
      // Salva o nome do motorista no sessionStorage antes de redirecionar.
      sessionStorage.setItem('driverName', state.driverName);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } 
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
          <p className="text-lg text-primary font-semibold pt-4">Motorista</p>
        </CardHeader>
        <CardContent className="grid gap-6 mt-4">
          <div className="grid gap-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" required aria-describedby='email-error' className="bg-input border-none rounded-full px-5 py-6 text-background" />
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
            </div>
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" name="senha" required aria-describedby='senha-error' className="bg-input border-none rounded-full px-5 py-6 text-background"/>
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
