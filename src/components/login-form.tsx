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
    // O componente Card serve como um contêiner principal para o formulário.
    // As classes definem que ele não terá sombra, borda ou cor de fundo própria, sendo transparente.
    <Card className="w-full max-w-sm shadow-none border-none bg-transparent">
      {/* O atributo `action` do formulário aponta para a nossa Server Action `formAction`. */}
      <form action={formAction}>
        {/* O CardHeader agrupa o conteúdo do cabeçalho do formulário. */}
        {/* As classes `flex-col`, `items-center` e `text-center` alinham tudo verticalmente e ao centro. */}
        <CardHeader className="flex flex-col items-center text-center space-y-4">
          {/* Este container define as dimensões responsivas para a logo. */}
          {/* A classe `relative` é necessária para que a imagem com `fill` funcione corretamente. */}
          <div className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] relative">
            {/* O componente Image do Next.js otimiza o carregamento da logo. */}
            {/* `fill` e `object-contain` garantem que a imagem preencha o container sem se distorcer. */}
            <Image
              src="/LogiDesk.Logo.png"
              alt="LogiDesk Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          {/* Este container agrupa os títulos "LogiDesk" e "Motorista". */}
          <div className="flex flex-col">
            {/* CardTitle exibe o nome principal do aplicativo com estilos de título responsivos. */}
            <CardTitle className="text-2xl md:text-4xl font-bold tracking-wider text-foreground">LogiDesk</CardTitle>
            {/* Parágrafo para o subtítulo "Motorista", com cor primária e tamanho de fonte responsivo. */}
            <p className="text-base md:text-lg text-primary font-semibold">Motorista</p>
          </div>
        </CardHeader>

        {/* CardContent agrupa os campos de entrada do formulário. */}
        <CardContent className="grid gap-6 mt-4">
          {/* Container para o campo de usuário. */}
          <div className="grid gap-2">
            {/* Componente Input para o campo "Usuário", com placeholder e validação de `required`. */}
            {/* `aria-describedby` conecta o input à sua mensagem de erro para acessibilidade. */}
            {/* As classes definem o estilo do input, incluindo fundo, borda e cantos arredondados. */}
            <Input id="usuario" type="text" name="usuario" placeholder="Usuário" required aria-describedby='usuario-error' className="bg-input border-none rounded-full px-5 py-3 md:py-6" />
            {/* Esta div exibe la mensagem de erro para o campo "usuario" se ela existir no estado retornado pela action. */}
            {/* `aria-live="polite"` informa leitores de tela sobre a mudança de forma não-intrusiva. */}
            <div id="usuario-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.usuario && <p className="text-sm font-medium text-destructive">{state.errors.usuario[0]}</p>}
            </div>
          </div>
          {/* Container para o campo de senha. */}
          <div className="grid gap-2">
            {/* Componente Input para o campo "Senha". */}
            <Input id="senha" type="password" name="senha" placeholder="Senha" required aria-describedby='senha-error' className="bg-input border-none rounded-full px-5 py-3 md:py-6"/>
            {/* Esta div exibe a mensagem de erro para o campo "senha" se ela existir no estado. */}
            <div id="senha-error" aria-live="polite" aria-atomic="true">
             {state?.errors?.senha && <p className="text-sm font-medium text-destructive">{state.errors.senha[0]}</p>}
            </div>
          </div>
        </CardContent>

        {/* CardFooter agrupa os botões de ação do formulário. */}
        <CardFooter className="mt-4">
          {/* Renderiza o componente SubmitButton, que gerencia o estado de "pending". */}
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
