import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/app/actions";
import Image from "next/image";
import RouteNotifications from "@/components/route-notifications";

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
                <p className="flex justify-between items-center text-sm"><strong>Status:</strong> <Badge variant="success">Pendente</Badge></p>
               </div>
               <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">Iniciar Rota</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
