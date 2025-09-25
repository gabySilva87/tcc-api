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
import { Label } from '@/components/ui/label';
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

  // Retorna a estrutura JSX do componente do formulário de login.
  return (
    // O componente `Card` serve como um contêiner principal para o formulário.
    // As classes definem a largura, removem sombra, borda e fundo para um visual limpo.
    <Card className="w-full max-w-sm shadow-none border-none bg-transparent">
      {/* O elemento `form` usa a Server Action `formAction` para lidar com o envio. */}
      <form action={formAction}>
        {/* `CardHeader` contém a logo e os títulos, centralizados com flexbox. */}
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          {/* Contêiner da imagem da logo com tamanho responsivo. `relative` é necessário para `fill` funcionar. */}
          <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] relative">
            {/* Componente `Image` do Next.js para otimização. */}
            <Image
              src="/LogiDesk.Logo.png"    // Caminho da imagem na pasta `public`.
              alt="LogiDesk Logo"         // Texto alternativo para acessibilidade.
              fill                        // Faz a imagem preencher o contêiner pai.
              className="object-contain"  // Garante que a imagem não seja distorcida.
              priority                    // Prioriza o carregamento desta imagem.
            />
          </div>
          {/* Contêiner para o título e subtítulo. */}
          <div className="flex flex-col pt-2">
            {/* Título principal da aplicação com tamanho responsivo. */}
            <CardTitle className="text-2xl md:text-4xl font-bold tracking-wider text-foreground">LogiDesk</CardTitle>
            {/* Subtítulo que identifica o tipo de usuário. */}
            <p className="text-base md:text-lg text-primary font-semibold">Motorista</p>
          </div>
        </CardHeader>

        {/* `CardContent` agrupa os campos de entrada do formulário. */}
        <CardContent className="grid gap-4 mt-4">
          {/* Campo de entrada para o nome de usuário. */}
          <div className="grid gap-2">
            <Label htmlFor="usuario" className="text-foreground/80">Usuário</Label>
            {/* Componente `Input` customizado com estilos para o fundo, borda e preenchimento. */}
            <Input id="usuario" type="text" name="usuario" placeholder="Digite seu usuário" required aria-describedby='usuario-error' className="bg-input border-none rounded-full px-5 py-3" />
            {/* Contêiner para exibir mensagens de erro de validação para o campo 'usuario'. */}
            <div id="usuario-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.usuario && <p className="text-sm font-medium text-destructive">{state.errors.usuario[0]}</p>}
            </div>
          </div>
          {/* Campo de entrada para a senha. */}
          <div className="grid gap-2">
            <Label htmlFor="senha">Senha</Label>
             {/* Componente `Input` para a senha. */}
            <Input id="senha" type="password" name="senha" placeholder="Digite sua senha" required aria-describedby='senha-error' className="bg-input border-none rounded-full px-5 py-3"/>
            {/* Contêiner para exibir mensagens de erro de validação para o campo 'senha'. */}
            <div id="senha-error" aria-live="polite" aria-atomic="true">
             {state?.errors?.senha && <p className="text-sm font-medium text-destructive">{state.errors.senha[0]}</p>}
            </div>
          </div>
        </CardContent>

        {/* `CardFooter` contém o botão de envio do formulário. */}
        <CardFooter className="mt-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
