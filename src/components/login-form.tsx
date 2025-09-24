'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { login } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
        <CardHeader className="flex flex-row items-center space-x-4">
          <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] relative">
            <Image
              src="/logo.png"
              alt="LogiDesk Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-2xl md:text-4xl font-bold tracking-wider text-foreground">LogiDesk</CardTitle>
            <p className="text-sm md:text-lg text-primary font-semibold">Motorista</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 mt-4">
          <div className="grid gap-2">
            <Input id="usuario" type="text" name="usuario" placeholder="Usuário" required aria-describedby='usuario-error' className="bg-input border-none rounded-full px-5 py-3 md:py-6" />
            <div id="usuario-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.usuario && <p className="text-sm font-medium text-destructive">{state.errors.usuario[0]}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Input id="senha" type="password" name="senha" placeholder="Senha" required aria-describedby='senha-error' className="bg-input border-none rounded-full px-5 py-3 md:py-6"/>
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
