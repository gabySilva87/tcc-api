import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import RouteNotifications from "@/components/route-notifications";
import { LogoutButton } from "@/components/logout-button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Image
                src="https://picsum.photos/seed/logo/40/40"
                alt="LogiDesk Logo"
                width={40}
                height={40}
                className="rounded-full"
                data-ai-hint="logo logistics"
              />
              <h1 className="text-xl font-bold text-foreground">LogiDesk</h1>
            </div>
            <div className="flex items-center gap-2">
               <Avatar>
                <AvatarImage src="https://picsum.photos/seed/driver/100/100" alt="Usuário" data-ai-hint="driver portrait" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo, Motorista!</h2>
          <p className="text-muted-foreground">Aqui estão suas atualizações mais recentes.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 flex flex-col gap-8">
            <RouteNotifications />
          </div>
          
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Próxima Entrega</CardTitle>
              <CardDescription>Centro da cidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                 <Image src="https://picsum.photos/seed/map/400/225" width={400} height={225} alt="Map of next delivery" className="object-cover w-full h-full" data-ai-hint="city map" />
              </div>
               <div className="mt-4 space-y-3">
                <p className="flex justify-between items-center text-sm"><strong>Horário:</strong> <span>14:00</span></p>
                <p className="flex justify-between items-center text-sm"><strong>Endereço:</strong> <span>Rua Principal, 123</span></p>
                <div className="flex justify-between items-center text-sm"><strong>Status:</strong> <Badge variant="success">Pendente</Badge></div>
               </div>
               <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">Iniciar Rota</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
