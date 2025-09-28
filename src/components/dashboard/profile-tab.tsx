
'use client'

// Importa os componentes de UI da biblioteca ShadCN.
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// Importa ícones da biblioteca lucide-react.
import { FileText, Smartphone, Truck, Star, Shield, ArrowLeft } from "lucide-react";

// Define a interface para as propriedades (`props`) que este componente recebe.
interface ProfileTabProps {
    driverName: string; // O nome do motorista.
    onBack: () => void; // Uma função para ser chamada quando o botão de voltar for clicado.
}

// O componente ProfileTab recebe as `props` (incluindo `driverName` e `onBack`).
export default function ProfileTab({ driverName, onBack }: ProfileTabProps) {
    // Determina a inicial do motorista para usar no `AvatarFallback`.
    const driverInitial = driverName ? driverName.charAt(0).toUpperCase() : 'M';

    // =======================================================================
    // INÍCIO DO JSX DO COMPONENTE
    // =======================================================================
    // Todo o conteúdo é envolvido por um componente `Card`.
    return (
        <Card>
            {/* Cabeçalho do cartão, agora com um botão de voltar. */}
            <CardHeader className="relative">
                <Button variant="ghost" size="icon" onClick={onBack} className="absolute top-4 left-4">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="text-center pt-8">
                    {/* Contêiner para o avatar, com uma borda colorida. */}
                    <div className="flex justify-center mb-4">
                        <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src="https://picsum.photos/seed/driver/100/100" alt="Motorista" data-ai-hint="driver portrait" />
                            {/* O `Fallback` mostra a inicial do nome se a imagem não carregar. */}
                            <AvatarFallback className="text-4xl">{driverInitial}</AvatarFallback>
                        </Avatar>
                    </div>
                    {/* Exibe o nome do motorista dinamicamente. Se não houver nome, mostra um placeholder. */}
                    <CardTitle className="text-3xl">{driverName || "Nome do Motorista"}</CardTitle>
                    <CardDescription>Motorista Profissional</CardDescription>
                </div>
            </CardHeader>
            {/* Conteúdo do cartão, organizado em um grid responsivo. */}
            <CardContent className="grid gap-6 md:grid-cols-2">
                {/* Seção de informações de contato. */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Informações de Contato</h3>
                    {/* Todos os dados nesta seção são estáticos/placeholders por enquanto. */}
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground"/>
                        <p>+55 (11) 98765-4321</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-muted-foreground"/>
                        <p>CNH: 123456789</p>
                    </div>
                </div>
                {/* Seção de estatísticas. */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Estatísticas</h3>
                    {/* Todos os dados nesta seção são estáticos/placeholders por enquanto. */}
                    <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-muted-foreground"/>
                        <p>128 Entregas Concluídas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-muted-foreground"/>
                        <p>Avaliação: 4.9 de 5 estrelas</p>
                    </div>
                </div>
                 {/* Seção de documentos, que ocupa as duas colunas em telas maiores (`md:col-span-2`). */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Documentos</h3>
                    {/* Um link de exemplo para um documento. */}
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <FileText className="w-5 h-5 text-muted-foreground"/>
                        <a href="#" className="flex-1">Certificado de Transporte de Cargas</a>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
