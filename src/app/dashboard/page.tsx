import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/app/actions";
import Image from "next/image";

const notifications = [
  {
    id: 1,
    title: "Nova Rota Atribuída",
    description: "Entrega para o centro da cidade às 14h. Detalhes no app de rotas.",
    time: "5 min atrás",
    read: false,
  },
  {
    id: 2,
    title: "Manutenção do Veículo Agendada",
    description: "Lembrete: Troca de óleo agendada para amanhã, 08:00.",
    time: "2 horas atrás",
    read: false,
  },
  {
    id: 3,
    title: "Rota Concluída",
    description: "Entrega #1024 foi concluída com sucesso.",
    time: "1 dia atrás",
    read: true,
  },
];

const LogiDeskLogo = () => (
    <svg
      className="w-8 h-8 text-primary"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M24 16L16 20V28L24 32L32 28V20L24 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 20L8 16L16 12L24 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 28L40 32L32 36L24 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 20L40 16L32 12L24 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 16V32L16 36V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M40 32V16L32 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <LogiDeskLogo />
              <h1 className="text-xl font-bold text-foreground">Driver Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
               <Avatar>
                <AvatarImage src="https://picsum.photos/seed/driver/100/100" alt="Driver" data-ai-hint="driver portrait" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <form action={logout}>
                <Button variant="ghost" size="icon" type="submit" aria-label="Sair">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-primary" />
                  <CardTitle>Notificações</CardTitle>
                </div>
                <Badge variant="default" className="bg-primary/90">2 novas</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {notifications.map((notification, index) => (
                    <li key={notification.id}>
                      <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 pt-1.5">
                          <span className={`block h-2.5 w-2.5 rounded-full ${!notification.read ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                          <p className="text-xs text-muted-foreground/80 mt-1">{notification.time}</p>
                        </div>
                        <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                      {index < notifications.length - 1 && <Separator className="mt-4" />}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
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
                <p className="flex justify-between items-center text-sm"><strong>Status:</strong> <Badge variant="outline" className="text-green-600 border-green-600">Pendente</Badge></p>
               </div>
               <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">Iniciar Rota</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
