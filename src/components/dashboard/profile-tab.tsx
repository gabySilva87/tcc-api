'use client'

// Importa os componentes de UI da biblioteca ShadCN.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// Importa ícones da biblioteca lucide-react.
import { ArrowLeft } from "lucide-react";

// Define a interface para as propriedades (`props`) que este componente recebe.
interface ProfileTabProps {
    driverName: string; // O nome do motorista.
    driverPhotoUrl: string; // A URL da foto do motorista.
    onBack: () => void; // Uma função para ser chamada quando o botão de voltar for clicado.
}

// O componente ProfileTab recebe as `props`.
export default function ProfileTab({ driverName, driverPhotoUrl, onBack }: ProfileTabProps) {
    // Determina a inicial do motorista para usar no `AvatarFallback`.
    const driverInitial = driverName ? driverName.charAt(0).toUpperCase() : 'M';

    // =======================================================================
    // INÍCIO DO JSX DO COMPONENTE
    // =======================================================================
    // Todo o conteúdo é envolvido por um componente `Card`.
    return (
        <Card>
            {/* Cabeçalho do cartão, agora com um botão de voltar. */}
            <CardHeader className="relative pb-6">
                <Button variant="ghost" size="icon" onClick={onBack} className="absolute top-4 left-4">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="text-center pt-8">
                    {/* Contêiner para o avatar, com uma borda colorida. */}
                    <div className="flex justify-center mb-4">
                        <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={driverPhotoUrl} alt={driverName} data-ai-hint="driver portrait" />
                            {/* O `Fallback` mostra a inicial do nome se a imagem não carregar. */}
                            <AvatarFallback className="text-4xl">{driverInitial}</AvatarFallback>
                        </Avatar>
                    </div>
                    {/* Exibe o nome do motorista dinamicamente. Se não houver nome, mostra um placeholder. */}
                    <CardTitle className="text-3xl">{driverName || "Nome do Motorista"}</CardTitle>
                    <CardDescription>Motorista Profissional</CardDescription>
                </div>
            </CardHeader>
            {/* Conteúdo do cartão foi removido para simplificar a tela. */}
            <CardContent>
                {/* O conteúdo foi intencionalmente deixado em branco para uma interface mais limpa. */}
                 <div className="h-48"></div>
            </CardContent>
        </Card>
    );
}
