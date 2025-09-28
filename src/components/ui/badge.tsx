
// Importa o React para a criação de componentes.
import * as React from "react"
// Importa a função `cva` (class-variance-authority) para criar variantes de componentes de forma organizada
// e o tipo `VariantProps` para extrair os tipos das variantes.
import { cva, type VariantProps } from "class-variance-authority"

// Importa a função utilitária `cn` para mesclar classes do Tailwind CSS de forma condicional e segura.
import { cn } from "@/lib/utils"

// `badgeVariants` usa `cva` para definir as classes CSS base e as variantes do componente Badge.
// O primeiro argumento são as classes base que se aplicam a todas as variantes.
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    // A propriedade `variants` define os diferentes estilos que o badge pode ter.
    variants: {
      variant: {
        // Estilo padrão: fundo primário, texto contrastante.
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        // Estilo secundário: fundo secundário.
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Estilo destrutivo (para erros): fundo vermelho, texto contrastante.
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        // Estilo de contorno: apenas uma borda, sem fundo.
        outline: "text-foreground",
        // Estilo de sucesso (que adicionamos): fundo verde, texto branco.
        success: "border-transparent bg-green-600 text-white"
      },
    },
    // Define qual variante será usada se nenhuma for especificada.
    defaultVariants: {
      variant: "default",
    },
  }
)

// A interface `BadgeProps` define as propriedades que o componente `Badge` pode receber.
// Ela herda todos os atributos de uma `div` HTML padrão...
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    // ...e também as propriedades de variante (`variant`) que definimos acima.
    VariantProps<typeof badgeVariants> {}

// A função do componente `Badge`.
function Badge({ className, variant, ...props }: BadgeProps) {
  // Retorna uma `div` que usa a função `cn` para aplicar as classes corretas.
  // `badgeVariants({ variant })` retorna as classes CSS correspondentes à variante escolhida.
  // `className` permite que classes adicionais sejam passadas de fora.
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Exporta o componente `Badge` e suas variantes para serem usados em outras partes do aplicativo.
export { Badge, badgeVariants }
