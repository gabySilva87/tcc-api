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

// Define o estado inicial para a Server Action. Este é o formato do objeto
// que a `login` action retornará.
const initialState = {
  success: false,       // Indica se a ação foi bem-sucedida.
  message: null,        // Armazena mensagens de sucesso ou erro globais.
  errors: {},           // Armazena erros de validação específicos de cada campo.
  driverName: null,     // Armazena o nome do motorista após o login bem-sucedido.
};

// Componente para o botão de envio do formulário. Ele é separado para poder
// usar o hook `useFormStatus`, que só funciona dentro de um `<form>`.
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
      {/* Exibe um ícone de carregamento se o formulário estiver sendo enviado (`pending` é true). */}
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Entrar
    </Button>
  );
}

// Componente principal do formulário de login.
export function LoginForm() {
  const router = useRouter(); // Hook para controlar a navegação.
  const { toast } = useToast(); // Hook para disparar notificações.
  
  // `useActionState` é o hook do React 19 para gerenciar o estado de formulários que usam Server Actions.
  // `state` contém a resposta da action (sucesso, erros, mensagens).
  // `formAction` é a função que será chamada quando o formulário for submetido (`<form action={formAction}>`).
  // `login` é a Server Action, e `initialState` é o estado inicial.
  const [state, formAction] = useActionState(login, initialState);

  // `useEffect` é usado para executar "efeitos colaterais" sempre que os valores em seu array de dependências mudam.
  // Neste caso, ele observa o `state` retornado pela Server Action para reagir a mudanças.
  useEffect(() => {
    // Se a action retornou sucesso e o nome do motorista...
    if (state?.success && state?.driverName) {
      // Exibe uma notificação de sucesso.
      toast({
        title: 'Sucesso!',
        description: state.message,
      });
      // Salva o nome do motorista no `sessionStorage` para ser usado em outras páginas (como o dashboard).
      // `sessionStorage` persiste dados apenas enquanto a aba do navegador está aberta.
      sessionStorage.setItem('driverName', state.driverName);
      
      // Aguarda 500ms para o usuário ver o toast antes de redirecionar para a dashboard.
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } 
    // Se a action retornou uma mensagem de erro (e não é apenas um erro de validação de campo)...
    else if (state?.message && state.message !== 'Dados inválidos.') {
      // Exibe uma notificação de erro do tipo "destructive".
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: state.message,
      });
    }
    // O array de dependências `[state, router, toast]` garante que este código só execute
    // quando o objeto `state` (ou `router` ou `toast`) mudar.
  }, [state, router, toast]);

  // =======================================================================
  // INÍCIO DO JSX DO COMPONENTE
  // =======================================================================
  return (
    // O `Card` serve como um contêiner para o formulário.
    <Card className="w-full max-w-sm shadow-none border-none bg-transparent">
      {/* O formulário HTML. `action={formAction}` vincula a submissão à nossa Server Action. */}
      <form action={formAction}>
        {/* Cabeçalho do cartão, com a logo e o título. */}
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] relative">
            {/* Componente `Image` otimizado do Next.js para a logo. */}
            <Image
              src="/LogiDesk.Logo.png"
              alt="LogiDesk Logo"
              fill
              className="object-contain"
              priority // Prioriza o carregamento da logo.
            />
          </div>
          <div className="flex flex-col pt-2">
            <CardTitle className="text-2xl md:text-4xl font-bold tracking-wider text-foreground">LogiDesk</CardTitle>
            <p className="text-base md:text-lg text-primary font-semibold">Motorista</p>
          </div>
        </CardHeader>

        {/* Conteúdo principal do cartão, com os campos de entrada. */}
        <CardContent className="grid gap-4 mt-2">
          {/* Seção para o campo de usuário. */}
          <div className="grid gap-2">
            {/* O `<Label>` melhora a acessibilidade, associando o texto ao campo de input. */}
            <Label htmlFor="usuario" className="text-foreground">Usuário</Label>
            {/* Campo de entrada de texto para o nome de usuário. */}
            <Input id="usuario" type="text" name="usuario" placeholder="Digite seu usuário" required aria-describedby='usuario-error' className="bg-white text-black placeholder:text-gray-500 rounded-full px-5 py-3" />
            {/* Contêiner para a mensagem de erro de validação do campo "usuário".
                `aria-live="polite"` informa aos leitores de tela para anunciar a mensagem quando ela aparecer. */}
            <div id="usuario-error" aria-live="polite" aria-atomic="true">
              {state?.errors?.usuario && <p className="text-sm font-medium text-destructive">{state.errors.usuario[0]}</p>}
            </div>
          </div>
          {/* Seção para o campo de senha. */}
          <div className="grid gap-2">
            <Label htmlFor="senha" className="text-foreground">Senha</Label>
            {/* Campo de entrada de senha. `type="password"` mascara o texto digitado. */}
            <Input id="senha" type="password" name="senha" placeholder="Digite sua senha" required aria-describedby='senha-error' className="bg-white text-black placeholder:text-gray-500 rounded-full px-5 py-3"/>
            {/* Contêiner para a mensagem de erro de validação do campo "senha". */}
            <div id="senha-error" aria-live="polite" aria-atomic="true">
             {state?.errors?.senha && <p className="text-sm font-medium text-destructive">{state.errors.senha[0]}</p>}
            </div>
          </div>
        </CardContent>

        {/* Rodapé do cartão, onde o botão de envio é colocado. */}
        <CardFooter className="mt-2">
          {/* O componente `SubmitButton` é usado aqui. Ele contém a lógica para exibir o estado de carregamento. */}
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
