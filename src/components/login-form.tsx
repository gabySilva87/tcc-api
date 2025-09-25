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

  // =======================================================================
  // INÍCIO DO JSX DO COMPONENTE
  // =======================================================================
  // O retorno do componente, que descreve a interface do usuário (UI).
  return (
    // O `Card` serve como um contêiner principal para o formulário,
    // com estilos que o fazem parecer um cartão. As classes de `w-full` e
    // `max-w-sm` o tornam responsivo. `shadow-none`, `border-none` e `bg-transparent`
    // garantem que ele se integre perfeitamente ao fundo da página.
    <Card className="w-full max-w-sm shadow-none border-none bg-transparent">
      {/* O formulário HTML. A `action` é vinculada à Server Action, que será executada no servidor. */}
      <form action={formAction}>
        {/* O cabeçalho do cartão, configurado para centralizar seu conteúdo verticalmente e horizontalmente. */}
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          {/* Este `div` serve como um contêiner para a imagem da logo. A classe `relative` é crucial
              para que o componente `Image` com a propriedade `fill` possa funcionar corretamente.
              As classes de largura e altura (`w-`, `h-`) definem o tamanho da logo. */}
          <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] relative">
            {/* Componente `Image` otimizado do Next.js.
                `src` é o caminho para a imagem.
                `alt` fornece texto alternativo para acessibilidade.
                `fill` faz a imagem preencher o contêiner pai (`div` relativo).
                `className="object-contain"` garante que a imagem mantenha sua proporção sem ser cortada.
                `priority` informa ao Next.js para carregar esta imagem com alta prioridade,
                o que é importante para o desempenho da página. */}
            <Image
              src="/LogiDesk.Logo.png"
              alt="LogiDesk Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          {/* Um `div` para agrupar o título e o subtítulo. */}
          <div className="flex flex-col pt-2">
            {/* Título principal do aplicativo. As classes controlam o tamanho e o estilo da fonte. */}
            <CardTitle className="text-2xl md:text-4xl font-bold tracking-wider text-foreground">LogiDesk</CardTitle>
            {/* Subtítulo que indica a persona do usuário. */}
            <p className="text-base md:text-lg text-primary font-semibold">Motorista</p>
          </div>
        </CardHeader>

        {/* Conteúdo principal do cartão, onde os campos de entrada do formulário são colocados. */}
        <CardContent className="grid gap-4 mt-4">
          {/* Seção para o campo de usuário. */}
          <div className="grid gap-2">
            {/* O `<Label>` melhora a acessibilidade e a usabilidade, mostrando o que o campo representa. */}
            <Label htmlFor="usuario" className="text-foreground/80">Usuário</Label>
            {/* O campo de entrada de texto para o nome de usuário.
                `id` e `name` são importantes para o formulário.
                `placeholder` fornece uma dica visual.
                `required` torna o campo obrigatório.
                `aria-describedby` conecta o input à sua mensagem de erro para acessibilidade. */}
            <Input id="usuario" type="text" name="usuario" placeholder="Digite seu usuário" required aria-describedby='usuario-error' className="bg-input border-none rounded-full px-5 py-3" />
            {/* Contêiner para a mensagem de erro de validação do campo "usuário".
                `aria-live="polite"` informa aos leitores de tela para anunciar a mensagem de erro quando ela aparecer. */}
            <div id="usuario-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.usuario && <p className="text-sm font-medium text-destructive">{state.errors.usuario[0]}</p>}
            </div>
          </div>
          {/* Seção para o campo de senha. */}
          <div className="grid gap-2">
            {/* Label para o campo de senha. */}
            <Label htmlFor="senha">Senha</Label>
            {/* Campo de entrada de senha. `type="password"` mascara o texto digitado. */}
            <Input id="senha" type="password" name="senha" placeholder="Digite sua senha" required aria-describedby='senha-error' className="bg-input border-none rounded-full px-5 py-3"/>
            {/* Contêiner para a mensagem de erro de validação do campo "senha". */}
            <div id="senha-error" aria-live="polite" aria-atomic="true">
             {state?.errors?.senha && <p className="text-sm font-medium text-destructive">{state.errors.senha[0]}</p>}
            </div>
          </div>
        </CardContent>

        {/* Rodapé do cartão, onde o botão de envio é colocado. */}
        <CardFooter className="mt-4">
          {/* O componente `SubmitButton` é usado aqui. Ele contém a lógica para exibir o estado de carregamento. */}
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
