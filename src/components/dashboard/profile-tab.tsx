
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Smartphone, Truck, Star, Shield } from "lucide-react";

interface ProfileTabProps {
    driverName: string;
}

export default function ProfileTab({ driverName }: ProfileTabProps) {
    const driverInitial = driverName ? driverName.charAt(0).toUpperCase() : 'M';

    return (
        <Card>
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <Avatar className="w-24 h-24 border-4 border-primary">
                        <AvatarImage src="https://picsum.photos/seed/driver/100/100" alt="Motorista" data-ai-hint="driver portrait" />
                        <AvatarFallback className="text-4xl">{driverInitial}</AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle className="text-3xl">{driverName || "Nome do Motorista"}</CardTitle>
                <CardDescription>Motorista Profissional</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Informações de Contato</h3>
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground"/>
                        <p>+55 (11) 98765-4321</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-muted-foreground"/>
                        <p>CNH: 123456789</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Estatísticas</h3>
                    <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-muted-foreground"/>
                        <p>128 Entregas Concluídas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-muted-foreground"/>
                        <p>Avaliação: 4.9 de 5 estrelas</p>
                    </div>
                </div>
                 <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Documentos</h3>
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <FileText className="w-5 h-5 text-muted-foreground"/>
                        <a href="#" className="flex-1">Certificado de Transporte de Cargas</a>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
